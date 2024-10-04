import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  items: {
    type: [
      {
        name: String,
        quantity: Number,
        totalPrice: Number,
        category: String,
        image: String,
        food: {
          type: mongoose.Schema.ObjectId,
          ref: "FoodMartItems",
        },
      },
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "FoodMartUsers",
    required: true,
  },
  rating: {
    type: {
      review:{type:String},
      rating: {type: Number,min:0,max:5},
      time: {type: Date},
    },
    default: {},
  },
});

export default mongoose.model("FoodMartOrders", orderSchema);
