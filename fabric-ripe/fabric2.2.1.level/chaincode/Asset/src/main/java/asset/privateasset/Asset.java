package asset.privateasset;

import com.owlike.genson.Genson;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

@DataType
public class Asset{

    private final static Genson genson = new Genson();

    @Property
    private String assetId;
    private String assetOwner;
    private String assetDescription;

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getAssetOwner() {
        return assetOwner;
    }

    public void setAssetOwner(String assetOwner) {
        this.assetOwner = assetOwner;
    } 
    public String getAssetDescription() {
        return assetDescription;
    }

    public void setAssetDescription(String assetDescription) {
        this.assetDescription = assetDescription;
    }
        
    public String toJSONString(){
        return genson.serialize(this).toString();
    }

    public static Asset fromJSONString(String json){
        Asset asset = genson.deserialize(json,Asset.class);
        return asset;
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "@" + " [assetId=" + assetId + ", assetOwner="
                + assetOwner + ", assetDescription=" + assetDescription + "]";
    }
}   