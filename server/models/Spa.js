import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    primary: { type: String, default: "#7c3aed" },
    secondary: { type: String, default: "#f5f3ff" },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    priceRange: { type: String, required: true },
    duration: { type: String, required: true },
    popular: { type: Boolean, default: false },
  },
  { _id: false }
);

const spaSchema = new mongoose.Schema(
  {
    spaId: { type: String, required: true, unique: true, index: true },
    spaName: { type: String, required: true },
    botName: { type: String, default: "Ava" },
    botImage: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    offer: { type: String, default: "" },
    colors: { type: colorSchema, default: () => ({}) },
    services: { type: [serviceSchema], default: [] },
    totalLeads: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model("Spa", spaSchema);

