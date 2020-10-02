/*
 * <%= spdxAndLicense // SPDX-License-Identifier: Apache-2.0 %>
 */

package org.example;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import org.json.JSONObject;

@DataType()
public class <%= assetPascalCase %> {

    @Property()
    public String privateValue;

    public <%= assetPascalCase %>(){
    }

    public String getPrivateValue() {
        return privateValue;
    }

    public void setPrivateValue(String privateValue) {
        this.privateValue = privateValue;
    }

    public String toJSONString() {
        return new JSONObject(this).toString();
    }

    public static <%= assetPascalCase %> fromJSONString(String json) {
        String privateValue = new JSONObject(json).getString("privateValue");
        <%= assetPascalCase %> asset = new <%= assetPascalCase %>();
        asset.setPrivateValue(privateValue);
        return asset;
    }
}
