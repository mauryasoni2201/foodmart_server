import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDb from "./config/db";
import errorHandler from "./error/errorHandler";
import userRouter from "./routes/userRoutes";
import foodRouter from "./routes/foodRoutes";
import orderRouter from "./routes/orderRoutes";
import path from "path";
import fileUpload from "express-fileupload";
import reviewRouter from "./routes/reviewRoutes";
dotenv.config({ path: "./.env" });

const app: Application = express();
connectDb();

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(express.json());  
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev"));
app.use(fileUpload());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api', userRouter);
app.use('/api/foods', foodRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews',reviewRouter);

app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
