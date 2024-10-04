import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    price:{
        required:true,
        type:Number 
    },
    description:{
        required:true,
        type:String
    },
    category:{
        required:true,
        type:String,
    },
    image:{
        type:String,
        default:""
    },
    averageRating:{
        type:Number,
        default:0
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

foodSchema.virtual("reviews",{
    localField:"_id",
    foreignField:"items.food",
    ref:"FoodMartOrders"
})

export default mongoose.model("FoodMartItems",foodSchema);