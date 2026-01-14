import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import Appliance from "../models/Appliance";
import ConsumptionLog from "../models/ConsumptionLog";

const router = Router();

router.post("/log", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { applianceId, minutes } = req.body;

  if (!applianceId || !minutes) return res.status(400).json({ message: "applianceId and minutes required" });

  const appliance = await Appliance.findOne({ _id: applianceId, userId });
  if (!appliance) return res.status(404).json({ message: "Appliance not found" });

  const kwh = (appliance.powerWatts * Number(minutes)) / 60 / 1000;

  const log = await ConsumptionLog.create({
    userId,
    applianceId,
    watts: appliance.powerWatts,
    minutes: Number(minutes),
    kwh,
    timestamp: new Date()
  });

  res.json(log);
});

router.get("/summary", requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const logs = await ConsumptionLog.find({ userId, timestamp: { $gte: since } });
  const totalKwh = logs.reduce((sum, l) => sum + (l.kwh || 0), 0);

  res.json({ totalKwhLast24h: Number(totalKwh.toFixed(4)), count: logs.length });
});

export default router;
