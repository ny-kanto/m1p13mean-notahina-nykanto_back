// controllers/evenement.controller.js
import evenementService from "../services/evenement.service.js";

// GET /evenements
export const getAllEvenements = async (req, res) => {
    try {
        const result = await evenementService.getAllEvenements(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /evenements/actifs
export const getEvenementsActifs = async (req, res) => {
    try {
        const result = await evenementService.getEvenementsActifs();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /evenements/:id
export const getEvenementById = async (req, res) => {
    try {
        const result = await evenementService.getEvenementById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// POST /evenements (admin)
export const createEvenement = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

        console.log("req.headers content-type:", req.headers["content-type"]);
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        const result = await evenementService.createEvenement(req.body, req.file, userId);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /evenements/:id (admin)
export const updateEvenement = async (req, res) => {
    try {
        const result = await evenementService.updateEvenement(req.params.id, req.body, req.file);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /evenements/:id (admin)
export const deleteEvenement = async (req, res) => {
    try {
        const result = await evenementService.deleteEvenement(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
