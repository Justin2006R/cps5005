import mongoose, { Schema } from "mongoose";

const ApplianceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    powerWatts: { type: Number, required: true },
    isOn: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Appliance", ApplianceSchema);
