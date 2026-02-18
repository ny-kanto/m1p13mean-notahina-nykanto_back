// models/Boutique.js
import mongoose from "mongoose";

const horaireJourSchema = new mongoose.Schema(
    {
        ouverture: { type: String }, // ex: "09:00"
        fermeture: { type: String }, // ex: "20:00"
        ferme: { type: Boolean, default: false }
    },
    { _id: false }
);

const boutiqueSchema = new mongoose.Schema({

//   nom: String,
//   categorie: String,
//   etage: Number,
//   contact: {
//     email: String,
//     tel: String
//   },
//   horaires: {
//     ouverture: String,
//     fermeture: String
//   },
//   statut: String,
//   created_at: String

    nom: {
        type: String,
        required: true,
        trim: true
    },

    categorie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categorie",
        required: true
    },

    etage: {
        type: Number,
        required: true
    },

    contact: {
        email: { type: String },
        tel: { type: String }
    },

    horaires: {
        lundi: horaireJourSchema,
        mardi: horaireJourSchema,
        mercredi: horaireJourSchema,
        jeudi: horaireJourSchema,
        vendredi: horaireJourSchema,
        samedi: horaireJourSchema,
        dimanche: horaireJourSchema
    },

    image: {
        url: String,
        public_id: String
    },

    noteMoyenne: { type: Number, default: 0 }, // ex: 4.2
    noteCompte: { type: Number, default: 0 },   // ex: 128

    created_at: {
        type: Date,
        default: Date.now
    }
});

boutiqueSchema.statics.isOpenNow = function (boutique) {
    if (!boutique || !boutique.horaires) return false;

    const jours = [
        "dimanche",
        "lundi",
        "mardi",
        "mercredi",
        "jeudi",
        "vendredi",
        "samedi"
    ];

    const now = new Date();
    const jourActuel = jours[now.getDay()];
    const horaireDuJour = boutique.horaires[jourActuel];

    if (!horaireDuJour) return false;
    if (horaireDuJour.ferme) return false;

    const heureActuelle =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

    return (
        heureActuelle >= horaireDuJour.ouverture &&
        heureActuelle <= horaireDuJour.fermeture
    );
};



export default mongoose.model("Boutique", boutiqueSchema);
