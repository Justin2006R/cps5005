import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import Appliance from "../models/Appliance";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const appliances = await Appliance.find({ userId }).sort({ createdAt: -1 });
  res.json(appliances);
});

router.post("/", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { name, powerWatts } = req.body;

  if (!name || !powerWatts) return res.status(400).json({ message: "name and powerWatts required" });

  const appliance = await Appliance.create({ userId, name, powerWatts, isOn: false });
  res.json(appliance);
});

router.put("/:id", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const updated = await Appliance.findOneAndUpdate(
    { _id: id, userId },
    { $set: req.body },
    { new: true }
  );

  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

export default router;
