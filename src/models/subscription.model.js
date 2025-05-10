import mongoose,{model, Schema} from "mongoose"

const subscriptionSchema=new Schema({
    subscriber: {
        type: Schema.Types.ObjectID,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectID,
        ref: "User"
    }
},
{timestamps: true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
