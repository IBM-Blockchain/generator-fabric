/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// <%= assetPascalCase %>Contract contract for managing CRUD for <%= assetPascalCase %>
type <%= assetPascalCase %>Contract struct {
	contractapi.Contract
}

var myCollectionName = "CollectionOne"

// <%= assetPascalCase %>Exists returns true when asset with given ID exists in private data collection
func (c *<%= assetPascalCase %>Contract) <%= assetPascalCase %>Exists(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) (bool, error) {
	data, err := ctx.GetStub().GetPrivateDataHash(myCollectionName, <%= assetCamelCase %>ID)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

// Create<%= assetPascalCase %> creates a new instance of <%= assetPascalCase %>
func (c *<%= assetPascalCase %>Contract) Create<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", <%= assetCamelCase %>ID)
	}

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)

	transientData, _ := ctx.GetStub().GetTransient()

	privateValue, exists := transientData["PrivateValue"]

	if len(transientData) == 0 || !exists {
		return fmt.Errorf("The privateValue key was not specified in transient data. Please try again")
	}

	<%= assetCamelCase %>.PrivateValue = string(privateValue)

	bytes, _ := json.Marshal(<%= assetCamelCase %>)

	return ctx.GetStub().PutPrivateData(myCollectionName, <%= assetCamelCase %>ID, bytes)
}

// Read<%= assetPascalCase %> retrieves an instance of <%= assetPascalCase %> from the private data collection
func (c *<%= assetPascalCase %>Contract) Read<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) (*<%= assetPascalCase %>, error) {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return nil, fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	bytes, _ := ctx.GetStub().GetPrivateData(myCollectionName, <%= assetCamelCase %>ID)

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)

	err = json.Unmarshal(bytes, <%= assetCamelCase %>)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal private data collection data to type <%= assetPascalCase %>")
	}

	return <%= assetCamelCase %>, nil
}

// Update<%= assetPascalCase %> retrieves an instance of <%= assetPascalCase %> from the private data collection and updates its value
func (c *<%= assetPascalCase %>Contract) Update<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	transientData, _ := ctx.GetStub().GetTransient()
	newValue, exists := transientData["PrivateValue"]

	if len(transientData) == 0 || !exists {
		return fmt.Errorf("The privateValue key was not specified in transient data. Please try again")
	}

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)
	<%= assetCamelCase %>.PrivateValue = string(newValue)

	bytes, _ := json.Marshal(<%= assetCamelCase %>)

	return ctx.GetStub().PutPrivateData(myCollectionName, <%= assetCamelCase %>ID, bytes)
}

// Delete<%= assetPascalCase %> deletes an instance of <%= assetPascalCase %> from the private data collection
func (c *<%= assetPascalCase %>Contract) Delete<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	return ctx.GetStub().DelPrivateData(myCollectionName, <%= assetCamelCase %>ID)
}

// Verify<%= assetPascalCase %> verifies the hash for an instance of <%= assetPascalCase %> from the private data collection matches the hash stored in the public ledger //FIXME check this
func (c *<%= assetPascalCase %>Contract) Verify<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string, objectToVerify *<%= assetPascalCase %>) (bool, error) {
	bytes, _ := json.Marshal(objectToVerify)
	hashToVerify := sha256.New()
	hashToVerify.Write(bytes)

	pdHashBytes, err := ctx.GetStub().GetPrivateDataHash(myCollectionName, <%= assetCamelCase %>ID)
	if err != nil {
		return false, err
	} else if len(pdHashBytes) == 0 {
		return false, fmt.Errorf("No private data hash with the Key: %s", <%= assetCamelCase %>ID)
	}

	return hex.EncodeToString(hashToVerify.Sum(nil)) == hex.EncodeToString(pdHashBytes), nil
}
