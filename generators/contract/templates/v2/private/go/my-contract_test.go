/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package main

import (
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

const getStateError = "private data get error"

var transient map[string][]byte

type MockStub struct {
	shim.ChaincodeStubInterface
	mock.Mock
}

func (ms *MockStub) GetPrivateData(collection string, key string) ([]byte, error) {
	args := ms.Called(collection, key)

	return args.Get(0).([]byte), args.Error(1)
}

func (ms *MockStub) GetPrivateDataHash(collection string, key string) ([]byte, error) {
	args := ms.Called(collection, key)

	return args.Get(0).([]byte), args.Error(1)
}

func (ms *MockStub) GetTransient() (map[string][]byte, error) {

	return transient, nil
}

func (ms *MockStub) PutPrivateData(collection string, key string, value []byte) error {
	args := ms.Called(collection, key, value)

	return args.Error(0)
}

func (ms *MockStub) DelPrivateData(collection string, key string) error {
	args := ms.Called(collection, key)

	return args.Error(0)
}

type MockContext struct {
	contractapi.TransactionContextInterface
	mock.Mock
}

func (mc *MockContext) GetStub() shim.ChaincodeStubInterface {
	args := mc.Called()

	return args.Get(0).(*MockStub)
}


func configureStub() (*MockContext, *MockStub) {
	var nilBytes []byte
	transient = make(map[string][]byte)

	test<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	test<%= assetPascalCase %>.PrivateValue = "set value"
	<%= assetCamelCase %>Bytes, _ := json.Marshal(test<%= assetPascalCase %>)
	hashToVerify := sha256.New()
	hashToVerify.Write(<%= assetCamelCase %>Bytes)

	ms := new(MockStub)
	ms.On("GetPrivateData", mock.AnythingOfType("string"), "statebad").Return(nilBytes, errors.New(getStateError))
	ms.On("GetPrivateData", mock.AnythingOfType("string"), "missingkey").Return(nilBytes, nil)
	ms.On("GetPrivateData", mock.AnythingOfType("string"), "existingkey").Return([]byte("some value"), nil)
	ms.On("GetPrivateData", mock.AnythingOfType("string"), "<%= assetCamelCase %>key").Return(<%= assetCamelCase %>Bytes, nil)
	ms.On("PutPrivateData", mock.AnythingOfType("string"), mock.AnythingOfType("string"), mock.AnythingOfType("[]uint8")).Return(nil)
	ms.On("DelPrivateData", mock.AnythingOfType("string"), mock.AnythingOfType("string")).Return(nil)
	ms.On("GetPrivateDataHash", mock.AnythingOfType("string"), "statebad").Return(nilBytes, errors.New(getStateError))
	ms.On("GetPrivateDataHash", mock.AnythingOfType("string"), "missingkey").Return(nilBytes, nil)
	ms.On("GetPrivateDataHash", mock.AnythingOfType("string"), "existingkey").Return([]byte("some hash value"), nil)
	ms.On("GetPrivateDataHash", mock.AnythingOfType("string"), "<%= assetCamelCase %>key").Return(hashToVerify.Sum(nil), nil)

	mc := new(MockContext)
	mc.On("GetStub").Return(ms)

	return mc, ms
}

func Test<%= assetPascalCase %>Exists(t *testing.T) {
	var exists bool
	var err error

	ctx, _ := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	exists, err = c.<%= assetPascalCase %>Exists(ctx, "statebad")
	assert.EqualError(t, err, getStateError)
	assert.False(t, exists, "should return false on error")

	exists, err = c.<%= assetPascalCase %>Exists(ctx, "missingkey")
	assert.Nil(t, err, "should not return error when can read from world state but no value for key")
	assert.False(t, exists, "should return false when no value for key in world state")

	exists, err = c.<%= assetPascalCase %>Exists(ctx, "existingkey")
	assert.Nil(t, err, "should not return error when can read from world state and value exists for key")
	assert.True(t, exists, "should return true when value for key in world state")
}

func TestCreate<%= assetPascalCase %>(t *testing.T) {
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	err = c.Create<%= assetPascalCase %>(ctx, "statebad")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors")

	err = c.Create<%= assetPascalCase %>(ctx, "existingkey")
	assert.EqualError(t, err, "The asset existingkey already exists", "should error when exists returns true")

	err = c.Create<%= assetPascalCase %>(ctx, "missingkey")
	assert.EqualError(t, err, "The privateValue key was not specified in transient data. Please try again")

	transient["PrivateValue"] = []byte("some value")
	err = c.Create<%= assetPascalCase %>(ctx, "missingkey")
	assert.Nil(t, err, "should not return error when transaction data provided")
	stub.AssertCalled(t, "PutPrivateData", "CollectionOne", "missingkey", []byte("{\"privateValue\":\"some value\"}"))
}

func TestRead<%= assetPascalCase %>(t *testing.T) {
	var <%= assetCamelCase %> *<%= assetPascalCase %>
	var err error

	ctx, _ := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "statebad")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors when reading")
	assert.Nil(t, <%= assetCamelCase %>, "should not return <%= assetPascalCase %> when exists errors when reading")

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "missingkey")
	assert.EqualError(t, err, "The asset missingkey does not exist", "should error when exists returns true when reading")
	assert.Nil(t, <%= assetCamelCase %>, "should not return <%= assetPascalCase %> when key does not exist in private data collection when reading")

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "existingkey")
	assert.EqualError(t, err, "Could not unmarshal private data collection data to type <%= assetPascalCase %>", "should error when data in key is not <%= assetPascalCase %>")
	assert.Nil(t, <%= assetCamelCase %>, "should not return <%= assetPascalCase %> when data in key is not of type <%= assetPascalCase %>")

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key")
	expected<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	expected<%= assetPascalCase %>.PrivateValue = "set value"
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in private data collection when reading")
	assert.Equal(t, expected<%= assetPascalCase %>, <%= assetCamelCase %>, "should return deserialized <%= assetPascalCase %> from private data collection")
}

func TestUpdate<%= assetPascalCase %>(t *testing.T) {
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	err = c.Update<%= assetPascalCase %>(ctx, "statebad")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors when updating")

	err = c.Update<%= assetPascalCase %>(ctx, "missingkey")
	assert.EqualError(t, err, "The asset missingkey does not exist", "should error when exists is false when updating")

	transient["PrivateValue"] = []byte("new value")
	err = c.Update<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key")
	expected<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	expected<%= assetPascalCase %>.PrivateValue = "new value"
	expected<%= assetPascalCase %>Bytes, _ := json.Marshal(expected<%= assetPascalCase %>)
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in private data collection when updating")
	stub.AssertCalled(t, "PutPrivateData", "CollectionOne", "<%= assetCamelCase %>key", expected<%= assetPascalCase %>Bytes)
}

func TestDelete<%= assetPascalCase %>(t *testing.T) {
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	err = c.Delete<%= assetPascalCase %>(ctx, "statebad")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors")

	err = c.Delete<%= assetPascalCase %>(ctx, "missingkey")
	assert.EqualError(t, err, "The asset missingkey does not exist", "should error when exists returns false when deleting")

	err = c.Delete<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key")
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in private data collection when deleting")
	stub.AssertCalled(t, "DelPrivateData", "CollectionOne", "<%= assetCamelCase %>key")
}

func TestVerify<%= assetPascalCase %>(t *testing.T) {
	var <%= assetCamelCase %> *<%= assetPascalCase %>
	var exists bool
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	<%= assetCamelCase %> = new(<%= assetPascalCase %>)
	<%= assetCamelCase %>.PrivateValue = "set value"

	exists, err = c.Verify<%= assetPascalCase %>(ctx, "statebad", <%= assetCamelCase %>)
	assert.False(t, exists, "should return false when unable to read the hash")
	assert.EqualError(t, err, getStateError)

	exists, err = c.Verify<%= assetPascalCase %>(ctx, "missingkey", <%= assetCamelCase %>)
	assert.False(t, exists, "should return false when key does not exist")
	assert.EqualError(t, err, "No private data hash with the Key: missingkey", "should error when key does not exist")

	exists, err = c.Verify<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key", <%= assetCamelCase %>)
	assert.True(t, exists, "should return true when hash in world state matched hash from data collection")
	assert.Nil(t, err, "should not return error when hash in world state matched hash from data collection")
	stub.AssertCalled(t, "GetPrivateDataHash", "CollectionOne", "<%= assetCamelCase %>key")
}
