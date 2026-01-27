import mongoose from "mongoose";

export const connectDB = (uri) => {
  mongoose.connect(uri)
    .then(() => console.log("MongoDB connecté ✅"))
    .catch(err => console.log("Erreur MongoDB:", err));
};