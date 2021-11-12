package asset.privateasset;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.json.JSONArray;
import org.json.JSONObject;
import org.hyperledger.fabric.shim.ledger.KeyModification;

import static java.nio.charset.StandardCharsets.UTF_8;



@Contract(name = "AssetContract", info = @Info(title = "AssetContract", description = "Contract for testing the private data", version = "1.0", license = @License(name = "Apache-2.0", url = ""), contact = @Contact(email = "assetcontract@example.com", name = "AssetContract", url = "http://AssetContract.me")))

@Default
public class AssetContract implements ContractInterface {
    
    //Method to retrieve the transaction history for the given key
    @Transaction()
    public String getTransactionHistory(Context ctx, String assetId) {

        QueryResultsIterator<KeyModification> queryResultsIterator = ctx.getStub().getHistoryForKey(assetId);
        JSONArray keyHistoryJsonArray = new JSONArray();
        for(KeyModification keyModification: queryResultsIterator){
            JSONObject keyHistory = new JSONObject();
            keyHistory.put("TransactionID", keyModification.getTxId());
            keyHistory.put("Value", new String(keyModification.getValue()));
            keyHistory.put("Timestamp", keyModification.getTimestamp());
            keyHistory.put("IsDeleted",keyModification.isDeleted());
            keyHistoryJsonArray.put(keyHistory);
        }
        return keyHistoryJsonArray.toString();
    
    }

    //Checks whether given asset is presen in the world state
    @Transaction()
    public boolean assetExists(Context ctx,String assetId){
        byte[] buffer = ctx.getStub().getState(assetId);
        return (buffer != null && buffer.length > 0);
    
    }

    //Creates an asset
    @Transaction()
    public String assetCreate(Context ctx, String assetId, String assetOwner, String assetDescription){

        boolean assetExists = assetExists (ctx, assetId);
        if (assetExists){
            throw new ChaincodeException("The given asset " + assetId + " already exists ");
        }

        Asset assetObject = new Asset();

        assetObject.setAssetId(assetId);
        assetObject.setAssetOwner(assetOwner);
        assetObject.setAssetDescription(assetDescription);

        ctx.getStub().putState(assetId, assetObject.toJSONString().getBytes(UTF_8));


        return String.format ("Following asset %s created successfully with transaction ID %s",assetObject.toString(),ctx.getStub().getTxId());
    }

    //Delete an asset
    @Transaction()
    public String assetDelete(Context ctx, String assetId){

        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " does not exists ");
        }
        
        ctx.getStub().delState(assetId);
        return String.format ("Following asset %s deleted successfully with transaction ID %s ",assetId,ctx.getStub().getTxId());
    }

    //Reads the asset from public world state
    @Transaction()
    public String assetRead(Context ctx, String assetId){

        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " doesn't exists ");
        }

        Asset assetObject = new Asset();
        assetObject = assetObject.fromJSONString(new String(ctx.getStub().getState(assetId),UTF_8));
        return assetObject.toString();
    }


    //Updates the asset from world state
    @Transaction()
    public String assetUpdate(Context ctx, String assetId, String assetDescription){
        
        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " doesn't exists ");
        }

        Asset assetObject = new Asset();
        assetObject = assetObject.fromJSONString(new String(ctx.getStub().getState(assetId),UTF_8));
        assetObject.setAssetDescription(assetDescription);
        ctx.getStub().putState(assetId, assetObject.toJSONString().getBytes(UTF_8));

        return String.format ("Following asset %s updated successfully with transaction ID %s",assetObject.toString(),ctx.getStub().getTxId());

    }

}
