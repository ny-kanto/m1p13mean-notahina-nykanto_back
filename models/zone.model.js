import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true }, // ex: store-hyper
  floor: { type: Number, required: true }, // 0 = RDC, 1 = étage 1
  boutiqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Boutique', default: null },
}, { timestamps: true });

export default mongoose.model('Zone', zoneSchema);