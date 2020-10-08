/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

const getStateError = "world state get error"

type MockStub struct {
	shim.ChaincodeStubInterface
	mock.Mock
}

func (ms *MockStub) GetState(key string) ([]byte, error) {
	args := ms.Called(key)

	return args.Get(0).([]byte), args.Error(1)
}

func (ms *MockStub) PutState(key string, value []byte) error {
	args := ms.Called(key, value)

	return args.Error(0)
}

func (ms *MockStub) DelState(key string) error {
	args := ms.Called(key)

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

	test<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	test<%= assetPascalCase %>.Value = "set value"
	<%= assetCamelCase %>Bytes, _ := json.Marshal(test<%= assetPascalCase %>)

	ms := new(MockStub)
	ms.On("GetState", "statebad").Return(nilBytes, errors.New(getStateError))
	ms.On("GetState", "missingkey").Return(nilBytes, nil)
	ms.On("GetState", "existingkey").Return([]byte("some value"), nil)
	ms.On("GetState", "<%= assetCamelCase %>key").Return(<%= assetCamelCase %>Bytes, nil)
	ms.On("PutState", mock.AnythingOfType("string"), mock.AnythingOfType("[]uint8")).Return(nil)
	ms.On("DelState", mock.AnythingOfType("string")).Return(nil)

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

	err = c.Create<%= assetPascalCase %>(ctx, "statebad", "some value")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors")

	err = c.Create<%= assetPascalCase %>(ctx, "existingkey", "some value")
	assert.EqualError(t, err, "The asset existingkey already exists", "should error when exists returns true")

	err = c.Create<%= assetPascalCase %>(ctx, "missingkey", "some value")
	stub.AssertCalled(t, "PutState", "missingkey", []byte("{\"value\":\"some value\"}"))
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
	assert.Nil(t, <%= assetCamelCase %>, "should not return <%= assetPascalCase %> when key does not exist in world state when reading")

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "existingkey")
	assert.EqualError(t, err, "Could not unmarshal world state data to type <%= assetPascalCase %>", "should error when data in key is not <%= assetPascalCase %>")
	assert.Nil(t, <%= assetCamelCase %>, "should not return <%= assetPascalCase %> when data in key is not of type <%= assetPascalCase %>")

	<%= assetCamelCase %>, err = c.Read<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key")
	expected<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	expected<%= assetPascalCase %>.Value = "set value"
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in world state when reading")
	assert.Equal(t, expected<%= assetPascalCase %>, <%= assetCamelCase %>, "should return deserialized <%= assetPascalCase %> from world state")
}

func TestUpdate<%= assetPascalCase %>(t *testing.T) {
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	err = c.Update<%= assetPascalCase %>(ctx, "statebad", "new value")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors when updating")

	err = c.Update<%= assetPascalCase %>(ctx, "missingkey", "new value")
	assert.EqualError(t, err, "The asset missingkey does not exist", "should error when exists returns true when updating")

	err = c.Update<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key", "new value")
	expected<%= assetPascalCase %> := new(<%= assetPascalCase %>)
	expected<%= assetPascalCase %>.Value = "new value"
	expected<%= assetPascalCase %>Bytes, _ := json.Marshal(expected<%= assetPascalCase %>)
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in world state when updating")
	stub.AssertCalled(t, "PutState", "<%= assetCamelCase %>key", expected<%= assetPascalCase %>Bytes)
}

func TestDelete<%= assetPascalCase %>(t *testing.T) {
	var err error

	ctx, stub := configureStub()
	c := new(<%= assetPascalCase %>Contract)

	err = c.Delete<%= assetPascalCase %>(ctx, "statebad")
	assert.EqualError(t, err, fmt.Sprintf("Could not read from world state. %s", getStateError), "should error when exists errors")

	err = c.Delete<%= assetPascalCase %>(ctx, "missingkey")
	assert.EqualError(t, err, "The asset missingkey does not exist", "should error when exists returns true when deleting")

	err = c.Delete<%= assetPascalCase %>(ctx, "<%= assetCamelCase %>key")
	assert.Nil(t, err, "should not return error when <%= assetPascalCase %> exists in world state when deleting")
	stub.AssertCalled(t, "DelState", "<%= assetCamelCase %>key")
}
