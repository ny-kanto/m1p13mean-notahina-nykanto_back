// controllers/avis.controller.js
import avisService from "../services/avis.service.js";

export const upsertAvis = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

    const { entityType, entityId, note, commentaire } = req.body;

    const result = await avisService.upsertAvis({
      userId,
      entityType,
      entityId,
      note: Number(note),
      commentaire,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAvis = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

    const result = await avisService.deleteAvis({
      avisId: req.params.id,
      userId,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAvisForEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page, limit } = req.query;

    const result = await avisService.getAvisForEntity({
      entityType,
      entityId,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
