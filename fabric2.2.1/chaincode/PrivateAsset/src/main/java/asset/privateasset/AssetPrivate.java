package asset.privateasset;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

import com.owlike.genson.Genson;

@DataType
public class AssetPrivate{

    private final static Genson genson = new Genson();

    @Property
    private String assetId;
    private String assetOwner;
    private String assetPrice;
    // private String assetPricePlain;

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

    public String getAssetPrice() {
        return assetPrice;
    }

    public void setAssetPrice(String assetPrice) {
        this.assetPrice = assetPrice;
    }
    
    // public String getAssetPricePlain() {
    //     return assetPricePlain;
    // }

    // public void setAssetPricePlain(String assetPricePlain) {
    //     this.assetPricePlain = assetPricePlain;
    // }

    public String toJSONString(){
        return genson.serialize(this).toString();
    }
    
    public static AssetPrivate fromJSONString(String json){
        AssetPrivate assetPrivate = genson.deserialize(json,AssetPrivate.class);
        return assetPrivate;
    } 

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "@" + " [assetId=" + assetId + ", assetOwner="
                + assetOwner + ", assetPrice=" + assetPrice + "]";
    }

}