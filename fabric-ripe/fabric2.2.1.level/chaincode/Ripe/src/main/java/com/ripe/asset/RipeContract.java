package com.ripe.asset;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.json.JSONArray;
import org.json.JSONObject;
import org.hyperledger.fabric.shim.ledger.CompositeKey;
import org.hyperledger.fabric.shim.ledger.KeyModification;
import org.hyperledger.fabric.shim.ledger.KeyValue;

import static java.nio.charset.StandardCharsets.UTF_8;
import java.util.Base64;
import java.util.Base64.Decoder;


@Contract(name = "RipeContract", info = @Info(title = "RipeContract", description = "Contract for handling the ripe data", version = "1.0", license = @License(name = "Apache-2.0", url = ""), contact = @Contact(email = "ripecontract@example.com", name = "RipeContract", url = "http://RipeContract.me")))

@Default
public class RipeContract implements ContractInterface {
    
    private Decoder decoder = Base64.getDecoder();

    //private static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss:SSSZZZZZ");
    
    //Method to retrieve the transaction history for the given key
    @Transaction()
    public String getTransactionHistory(Context ctx, String clientID, String foodBundleID, String transactionID) {
        CompositeKey assetKey = ctx.getStub().createCompositeKey(clientID, foodBundleID,transactionID);
        QueryResultsIterator<KeyModification> queryResultsIterator = ctx.getStub().getHistoryForKey(assetKey.toString());
        JSONArray keyHistoryJsonArray = new JSONArray();
        for(KeyModification keyModification: queryResultsIterator){
            JSONObject keyHistory = new JSONObject();
            keyHistory.put("TransactionID", keyModification.getTxId());
            keyHistory.put("Value", new String(keyModification.getValue()));
            keyHistory.put("Timestamp", keyModification.getTimestamp());
            keyHistory.put("IsDeleted",keyModification.isDeleted());
            keyHistoryJsonArray.put(keyHistory);
        }
        System.out.println(keyHistoryJsonArray.toString());
        return keyHistoryJsonArray.toString();
    
    }

    //Checks whether given asset is presen in the world state
    @Transaction()
    private boolean assetExists(Context ctx,String assetKey){
        byte[] buffer = ctx.getStub().getState(assetKey);
        return (buffer != null && buffer.length > 0);
    
    }

  
    //Creates an asset
    @Transaction()
    public String assetCreate(Context ctx, String clientID, String foodBundleID, String transactionID, String userName,
                                String stageEvenSequenceDataHash, String createdAt){
       
        CompositeKey assetKey = ctx.getStub().createCompositeKey(clientID, foodBundleID,transactionID);
        RipeAsset assetObject = new RipeAsset();
        assetObject.setClientID(clientID);
        assetObject.setFoodBundleID(foodBundleID);
        assetObject.setTransactionID(transactionID);
        assetObject.setUserName(userName);
        assetObject.setStageEvenSequenceDataHash(decoder.decode(stageEvenSequenceDataHash));
        assetObject.setCreatedAt(createdAt);
        ctx.getStub().putState(assetKey.toString(), assetObject.toJSONString().getBytes(UTF_8));
         
        return("{\"transactionId\":"+"\""+ctx.getStub().getTxId()+"\"}");
    }

    
    //Reads the asset 
    @Transaction()
    public String assetRead(Context ctx, String clientID, String foodBundleID, String transactionID){
        
        CompositeKey assetKey = ctx.getStub().createCompositeKey(clientID,foodBundleID,transactionID);
        boolean assetExists = assetExists (ctx, assetKey.toString());
        if (!assetExists){
            return ("The given ripe asset " + assetKey + " doesn't exists ");
        }

        RipeAsset assetObject = new RipeAsset();
        assetObject = assetObject.fromJSONString(new String(ctx.getStub().getState(assetKey.toString()),UTF_8));
        System.out.println(assetObject.getripeJSON().toString());
        return assetObject.getripeJSON().toString();
    }

    //Reads the asset with CompositeKey
    @Transaction()
    public String assetReadPartial(Context ctx, String clientID, String foodBundleID ){
        
        CompositeKey assetKey = ctx.getStub().createCompositeKey(clientID, foodBundleID);
        QueryResultsIterator<KeyValue> queryResultsIterator = ctx.getStub().getStateByPartialCompositeKey(assetKey);
        RipeAsset assetObject = new RipeAsset();
        
        JSONArray assetObjects  = new JSONArray();
        while(queryResultsIterator.iterator().hasNext())
        {   
           KeyValue keyValue = queryResultsIterator.iterator().next();
           assetObject = assetObject.fromJSONString(new String(keyValue.getValue(),UTF_8));
           assetObjects.put(assetObject.getripeJSON());
        }
        System.out.println(assetObjects.toString());
        return assetObjects.toString();
    }
 
 

}
