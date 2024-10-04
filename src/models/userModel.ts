import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: Number,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    role: {
      type: String,
      enum: ["user"],
      default:"user"
    },
    password: {
      type: String,
      required: true
    },
    address: {
      type: String,
      default:""
    },
    otp: {
      type: Number,
      default:0
    },
    isUser: {
      type: Boolean,
      default:false
    },
    image:{
      type:String,
      default:""
    },
    userStatus:{
      type:Boolean,
      default:false
    },
},
{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
})

userSchema.virtual("orders",{
  ref:"FoodMartOrders",
  localField:"_id",
  foreignField:"user"
});

export default mongoose.model("FoodMartUsers", userSchema);
