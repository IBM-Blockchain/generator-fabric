/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package main

import (
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-contract-api-go/metadata"
)

func main() {
	<%= assetCamelCase %>Contract := new(<%= assetPascalCase %>Contract)
	<%= assetCamelCase %>Contract.Info.Version = "<%= version %>"
	<%= assetCamelCase %>Contract.Info.Description = "<%= description %>"
	<%= assetCamelCase %>Contract.Info.License = new(metadata.LicenseMetadata)
	<%= assetCamelCase %>Contract.Info.License.Name = "<%= license %>"
	<%= assetCamelCase %>Contract.Info.Contact = new(metadata.ContactMetadata)
	<%= assetCamelCase %>Contract.Info.Contact.Name = "<%= author %>"

	chaincode, err := contractapi.NewChaincode(<%= assetCamelCase %>Contract)
	chaincode.Info.Title = "<%= name %> chaincode"
	chaincode.Info.Version = "<%= version %>"

	if err != nil {
		panic("Could not create chaincode from <%= assetPascalCase %>Contract." + err.Error())
	}

	err = chaincode.Start()

	if err != nil {
		panic("Failed to start chaincode. " + err.Error())
	}
}
