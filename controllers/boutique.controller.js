import boutiqueService from '../services/boutique.service.js';
import Boutique from '../models/boutique.model.js';


export const getAllBoutiques = async (req, res) => {
    try {
        const result = await boutiqueService.getAllBoutiques(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const getBoutiqueById = async (req, res) => {
    try {
        const result = await boutiqueService.getBoutiqueById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


export const createBoutique = async (req, res) => {
    try {
        const image = req.file
            ? {
                url: req.file.path,
                public_id: req.file.filename
            }
            : null;

        const result = await boutiqueService.createBoutique({
            ...req.body,
            image
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const updateBoutique = async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("FILE:", req.file);


        const result = await boutiqueService.updateBoutique(
            req.params.id,
            req.body,
            req.file
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


export const deleteBoutique = async (req, res) => {
    try {
        const result = await boutiqueService.deleteBoutique(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



export const getStatistics = async (req, res) => {
    try {
        const result = await boutiqueService.getStatistics();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const searchBoutiques = async (req, res) => {
    try {
        const result = await boutiqueService.searchBoutiques(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
