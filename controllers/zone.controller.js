import Zone from "../models/zone.model.js";

export const getZones = async (req, res) => {
  const zones = await Zone.find().populate('boutiqueId');
  res.json(zones);
};

export const assignZone = async (req, res) => {

  console.log("Assigning zone with data:", req.body);
  
  const { boutiqueId } = req.body;

  const zone = await Zone.findOneAndUpdate(
    { zoneId: req.params.zoneId },
    {
      boutiqueId,
      status: boutiqueId ? 'occupied' : 'free'
    },
    { new: true }
  );

  res.json(zone);
};
