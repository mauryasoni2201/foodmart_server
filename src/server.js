"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db"));
const errorHandler_1 = __importDefault(require("./error/errorHandler"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const foodRoutes_1 = __importDefault(require("./routes/foodRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const path_1 = __importDefault(require("path"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
dotenv_1.default.config({ path: "./.env" });
const app = (0, express_1.default)();
(0, db_1.default)();
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)("dev"));
app.use((0, express_fileupload_1.default)());
app.use('/public', express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use('/api', userRoutes_1.default);
app.use('/api/foods', foodRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
app.use(errorHandler_1.default);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
