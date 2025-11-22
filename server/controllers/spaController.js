import Spa from "../models/Spa.js";

export const getSpaConfig = async (req, res, next) => {
  try {
    const { spaId } = req.params;
    
    if (!spaId) {
      return res.status(400).json({ message: "Spa ID is required" });
    }

    const spa = await Spa.findOne({ spaId });
    
    if (!spa) {
      return res.status(404).json({ 
        message: "Spa not found",
        spaId: spaId 
      });
    }

    if (!spa.isActive) {
      return res.status(403).json({ 
        message: "Spa is not active",
        spaId: spaId 
      });
    }

    // Return spa config with sanitized botImage (null instead of empty string)
    const config = spa.toObject();
    if (config.botImage === "" || !config.botImage) {
      config.botImage = null;
    }
    res.json(config);
  } catch (error) {
    console.error('[getSpaConfig] Error:', error);
    next(error);
  }
};

export const getSpas = async (_req, res, next) => {
  try {
    const spas = await Spa.find().sort({ createdAt: -1 });
    res.json(spas);
  } catch (error) {
    next(error);
  }
};

export const createSpa = async (req, res, next) => {
  try {
    // Sanitize botImage: convert empty string to null
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.botImage === "" || (sanitizedBody.botImage && sanitizedBody.botImage.trim() === "")) {
      sanitizedBody.botImage = null;
    }
    const spa = await Spa.create(sanitizedBody);
    res.status(201).json(spa);
  } catch (error) {
    next(error);
  }
};

export const updateSpa = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Sanitize botImage: convert empty string to null
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.botImage === "" || (sanitizedBody.botImage && sanitizedBody.botImage.trim() === "")) {
      sanitizedBody.botImage = null;
    }
    const spa = await Spa.findByIdAndUpdate(id, sanitizedBody, {
      new: true,
      runValidators: true,
    });
    if (!spa) {
      return res.status(404).json({ message: "Spa not found" });
    }
    res.json(spa);
  } catch (error) {
    next(error);
  }
};

export const deleteSpa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const spa = await Spa.findByIdAndDelete(id);
    if (!spa) {
      return res.status(404).json({ message: "Spa not found" });
    }
    res.json({ message: "Spa deleted" });
  } catch (error) {
    next(error);
  }
};

