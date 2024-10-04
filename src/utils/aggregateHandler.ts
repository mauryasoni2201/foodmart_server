import FoodMartOrders from "../models/orderModel";
import FoodMartItems from "../models/foodModel";

const calculateAggregateRatings = async (): Promise<void> => {
    const aggregateResults = await FoodMartOrders.aggregate([
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: "$items.food",
                averageRating: {
                    $avg: {
                        $cond: [
                            { $ne: ["$rating.rating", null] },
                            "$rating.rating",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    for (const result of aggregateResults) {
        await FoodMartItems.findByIdAndUpdate(result._id, {
            averageRating: parseFloat(result.averageRating.toFixed(2))
        });
    }
};

export default calculateAggregateRatings;
