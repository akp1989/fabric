package com.ripe.asset;

import java.util.Base64.Encoder;
import java.util.Base64;
import com.owlike.genson.Genson;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import org.json.JSONObject;

@DataType
public class RipeAsset{

    private final static Genson genson = new Genson();
    private Encoder encoder = Base64.getEncoder();
   
    @Property
    private String clientID;
    private String foodBundleID;
    private String transactionID;
    private String userName;
    private byte[] stageEvenSequenceDataHash;
    private String createdAt;

    public String getClientID(){
        return clientID;
    }

    public void setClientID(String clientID){
        this.clientID = clientID;
    }
       
    public String getFoodBundleID() {
        return foodBundleID;
    }

    public void setFoodBundleID(String foodBundleID) {
        this.foodBundleID = foodBundleID;
    }

    public String getTransactionID() {
        return transactionID;
    }

    public void setTransactionID(String transactionID) {
        this.transactionID = transactionID;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public byte[] getStageEvenSequenceDataHash() {
        return stageEvenSequenceDataHash;
    }

    public void setStageEvenSequenceDataHash(byte[] stageEvenSequenceDataHash) {
        this.stageEvenSequenceDataHash = stageEvenSequenceDataHash;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String toJSONString(){
        return genson.serialize(this).toString();
    }

    public static RipeAsset fromJSONString(String json){
        RipeAsset ripeAsset = genson.deserialize(json,RipeAsset.class);
        return ripeAsset;
    }

    
    public JSONObject getripeJSON() {
       JSONObject ripeJSON = new JSONObject();
        ripeJSON.put("clientID",getClientID());
        ripeJSON.put("foodBundleID",getFoodBundleID());
        ripeJSON.put("transactionID",getTransactionID());
        ripeJSON.put("userName",getUserName());
        ripeJSON.put("stageEvenSequenceDataHash",encoder.encodeToString(getStageEvenSequenceDataHash()));
        ripeJSON.put("createdAt",this.createdAt);

        return ripeJSON;
    }
}   