import mongoose from 'mongoose';

const produitSchema = new mongoose.Schema({
  nom: {type : String, required : true},
  prix : {type : Number, required : true},
  description : String,
  stock : {type : Number, default: 0},
  boutiqueId : {type : mongoose.Schema.ObjectId, ref : 'Boutique', required : true},
  image : String,
},{timestamps : true});

export default mongoose.model('Produit', produitSchema);