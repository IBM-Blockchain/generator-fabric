/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// <%= assetPascalCase %>Contract contract for managing CRUD for <%= assetPascalCase %>
type <%= assetPascalCase %>Contract struct {
	contractapi.Contract
}

// <%= assetPascalCase %>Exists returns true when asset with given ID exists in world state
func (c *<%= assetPascalCase %>Contract) <%= assetPascalCase %>Exists(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) (bool, error) {
	data, err := ctx.GetStub().GetState(<%= assetCamelCase %>ID)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

// Create<%= assetPascalCase %> creates a new instance of <%= assetPascalCase %>
func (c *<%= assetPascalCase %>Contract) Create<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string, value string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", <%= assetCamelCase %>ID)
	}

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)
	<%= assetCamelCase %>.Value = value

	bytes, _ := json.Marshal(<%= assetCamelCase %>)

	return ctx.GetStub().PutState(<%= assetCamelCase %>ID, bytes)
}

// Read<%= assetPascalCase %> retrieves an instance of <%= assetPascalCase %> from the world state
func (c *<%= assetPascalCase %>Contract) Read<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) (*<%= assetPascalCase %>, error) {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return nil, fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return nil, fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	bytes, _ := ctx.GetStub().GetState(<%= assetCamelCase %>ID)

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)

	err = json.Unmarshal(bytes, <%= assetCamelCase %>)

	if err != nil {
		return nil, fmt.Errorf("Could not unmarshal world state data to type <%= assetPascalCase %>")
	}

	return <%= assetCamelCase %>, nil
}

// Update<%= assetPascalCase %> retrieves an instance of <%= assetPascalCase %> from the world state and updates its value
func (c *<%= assetPascalCase %>Contract) Update<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string, newValue string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	<%= assetCamelCase %> := new(<%= assetPascalCase %>)
	<%= assetCamelCase %>.Value = newValue

	bytes, _ := json.Marshal(<%= assetCamelCase %>)

	return ctx.GetStub().PutState(<%= assetCamelCase %>ID, bytes)
}

// Delete<%= assetPascalCase %> deletes an instance of <%= assetPascalCase %> from the world state
func (c *<%= assetPascalCase %>Contract) Delete<%= assetPascalCase %>(ctx contractapi.TransactionContextInterface, <%= assetCamelCase %>ID string) error {
	exists, err := c.<%= assetPascalCase %>Exists(ctx, <%= assetCamelCase %>ID)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if !exists {
		return fmt.Errorf("The asset %s does not exist", <%= assetCamelCase %>ID)
	}

	return ctx.GetStub().DelState(<%= assetCamelCase %>ID)
}
