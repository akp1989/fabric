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

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;


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

    //Checks whether given asset is presen in the world state
    @Transaction()
    public boolean assetPrivateExists(Context ctx,String assetId){
        byte[] buffer = null;
        try{
            buffer = ctx.getStub().getPrivateData(getImplicitPolicy(ctx), assetId);
        }catch(Exception ex){
            throw new ChaincodeException("The private information for asset " + assetId + " is not accesible ");
        }        
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
        AssetPrivate assetPrivateObject = new AssetPrivate();

        assetObject.setAssetId(assetId);
        assetObject.setAssetOwner(assetOwner);
        assetObject.setAssetDescription(assetDescription);
        String assetPrice = "";
        try{
            Map<String, byte[]> transientData= ctx.getStub().getTransient();
            assetPrice = new String (transientData.get("assetPrice"),UTF_8);
        }catch (Exception ex){
            throw new ChaincodeException(ex.getLocalizedMessage());
        }

        assetPrivateObject.setAssetId(assetId);
        assetPrivateObject.setAssetOwner(assetOwner);
        assetPrivateObject.setAssetPrice(assetPrice);
        
        //ctx.getStub().setStateValidationParameter(assetId, stateValidationEndorsement(ctx));
        ctx.getStub().putState(assetId, assetObject.toJSONString().getBytes(UTF_8));
        //ctx.getStub().setPrivateDataValidationParameter(getImplicitPolicy(ctx), assetId, stateValidationEndorsement(ctx));
        ctx.getStub().putPrivateData(getImplicitPolicy(ctx), assetId, assetPrivateObject.toJSONString().getBytes(UTF_8));

        return String.format ("Following asset %s created successfully with transaction ID %s",assetObject.toString(),ctx.getStub().getTxId());
    }

    //Delete an asset
    @Transaction()
    public String assetDelete(Context ctx, String assetId){

        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " does not exists ");
        }
        
        ctx.getStub().delPrivateData(getImplicitPolicy(ctx),assetId);
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

    //Reads the asset from private state ledger
    @Transaction()
    public String assetReadPrivate(Context ctx, String assetId){
        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " doesn't exists ");
        }
        if(assetPrivateExists(ctx,assetId)){
            AssetPrivate assetPrivateObject = new AssetPrivate();
            assetPrivateObject = assetPrivateObject.fromJSONString(new String(ctx.getStub().getPrivateData(getImplicitPolicy(ctx),assetId),UTF_8));
            return assetPrivateObject.toString();
        }else{
            return ("The private information for asset " + assetId + " is not accesible");
        }
        
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
        //ctx.getStub().delState(assetId);
        //ctx.getStub().setStateValidationParameter(assetId, stateValidationEndorsement(ctx));
        ctx.getStub().putState(assetId, assetObject.toJSONString().getBytes(UTF_8));

        return String.format ("Following asset %s updated successfully with transaction ID %s",assetObject.toString(),ctx.getStub().getTxId());

    }

    //Updates the asset from the private state ledger 
    @Transaction()
    public String assetUpdatePrivate(Context ctx, String assetId, String assetPrice){
        
        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " doesn't exists ");
        }
        if(assetPrivateExists(ctx,assetId)){
            AssetPrivate assetPrivateObject = new AssetPrivate();
            assetPrivateObject = assetPrivateObject.fromJSONString(new String(ctx.getStub().getPrivateData(getImplicitPolicy(ctx),assetId),UTF_8));
            assetPrivateObject.setAssetPrice(assetPrice);
            //ctx.getStub().delPrivateData(getImplicitPolicy(ctx),assetId);
            //ctx.getStub().setPrivateDataValidationParameter(getImplicitPolicy(ctx), assetId, stateValidationEndorsement(ctx));
            ctx.getStub().putPrivateData(getImplicitPolicy(ctx), assetId, assetPrivateObject.toJSONString().getBytes(UTF_8));

            return String.format ("Following asset's private information %s updated successfully with transaction ID %s",assetPrivateObject.toString(),ctx.getStub().getTxId());
        }else{
            return ("The private information for asset " + assetId + " is not accesible");
        }
    }

    //Verifies the private data hash with the private data sent
    @Transaction()
    public String assetVerifyHash(Context ctx, String assetId,String assetOwner, String assetOwnerId)throws NoSuchAlgorithmException{
        boolean assetMatch = false;
        boolean assetStringMatch =false;
        //Check if the asset exists
        boolean assetExists = assetExists (ctx, assetId);
        if (!assetExists){
            throw new ChaincodeException("The given asset " + assetId + " doesn't exists ");
        }

        //Create the private data object and hash it to verify it against the private data hash from ledger
        String assetPrice = "";
        AssetPrivate assetPrivateObject = new AssetPrivate();
        try{
            Map<String, byte[]> transientData= ctx.getStub().getTransient();
            assetPrice = new String (transientData.get("assetPrice"),UTF_8);
        }catch (Exception ex){
            throw new ChaincodeException(ex.getLocalizedMessage());
        }
        assetPrivateObject.setAssetId(assetId);
        assetPrivateObject.setAssetOwner(assetOwner);
        assetPrivateObject.setAssetPrice(assetPrice);

        byte[] privateHashTemp = assetPrivateObject.toJSONString().getBytes(UTF_8);
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        byte[] privateHashTempFinal = messageDigest.digest(privateHashTemp);
        //Retrieve the private data hash for the given asset from the ledger
        byte[] privateHashOriginal = ctx.getStub().getPrivateDataHash(getImplicitPolicy(assetOwnerId), assetId);

        if(privateHashTempFinal == privateHashOriginal)
            assetMatch=true;
        if(new String(privateHashTempFinal,UTF_8).equals(new String(privateHashOriginal,UTF_8)))
            assetStringMatch=true;

        return String.format ("The asset and private hash match is of status %s, %s and temporarily sharing the temp %s and private data hash %s",assetMatch,assetStringMatch,new String (privateHashTempFinal,UTF_8), new String(privateHashOriginal,UTF_8));
    }

    /* Creates the implcit private data collection with the MSP ID of the invoking organization
    *  1) Creating a new entry does not impact and just assigns the private data collection or implicit private policy is applied
    *  2) While updating the existing ledger entry then the private data collection or implicit private policy takes effect
    *       a) Address the invoke to only the organization/organizations from private data collection or implicit private policy
    */
    public String getImplicitPolicy(Context ctx){
        return String.format("_implicit_org_%s",ctx.getClientIdentity().getMSPID());
    }

    public String getImplicitPolicy(String mspid){
        return String.format("_implicit_org_%s",mspid);
    }

    /* Creates a state based endorsement policy  
     * Endorsement should be a strict "AND(<ORGXMSP.PEER>,<ORGYMSP.PEER>....<ORGZMSP.PEER>" - List of all the organizations in the  
     * 1) Creating a new ledger entry does not have any impact and just assigns the endorsement policy
     * 2) While updating the existing ledger entry then the state based endorsement policy takes effect, use one of the following
     *      a) Address the invoke to all the organization
     *      b) Address the invoke to atlease all the organization from the state based endorsment policy 
    */
    // public byte[] stateValidationEndorsement(Context ctx){
    //     StateBasedEndorsementFactory stateBasedEndorsementFactory = new StateBasedEndorsementFactory();
    //     StateBasedEndorsement stateBasedEndorsement = stateBasedEndorsementFactory.newStateBasedEndorsement(null);
    //     stateBasedEndorsement.addOrgs(RoleType.RoleTypePeer, ctx.getClientIdentity().getMSPID());
    //     stateBasedEndorsement.addOrgs(RoleType.RoleTypePeer,"Org4MSP");
    //     return stateBasedEndorsement.policy();
    // } 

}
