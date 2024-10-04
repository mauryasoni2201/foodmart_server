import mongoose from "mongoose";

const connectDb=async():Promise<void>=>{
    try{
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Database Connected!`)
    }catch(error){
        throw new Error('Error occured while connecting database!');
    }
}

export default connectDb;