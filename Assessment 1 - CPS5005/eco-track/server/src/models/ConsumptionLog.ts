import mongoose, { Schema } from "mongoose";

const ConsumptionLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applianceId: { type: Schema.Types.ObjectId, ref: "Appliance", required: true },
    timestamp: { type: Date, default: Date.now },
    watts: { type: Number, required: true },
    minutes: { type: Number, required: true },
    kwh: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("ConsumptionLog", ConsumptionLogSchema);
