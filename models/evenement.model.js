import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
    {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
    },
    { _id: false }
);

const evenementSchema = new mongoose.Schema(
    {
        titre: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        dateDebut: {
            type: Date,
            required: true,
            index: true,
        },

        dateFin: {
            type: Date,
            required: true,
            index: true,
        },

        image: {
            type: imageSchema,
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: false,
    }
);


evenementSchema.pre("validate", function () {
    if (this.dateDebut && this.dateFin && this.dateFin < this.dateDebut) {
        throw new Error("dateFin doit être >= dateDebut");
    }
});

evenementSchema.virtual("isActive").get(function () {
    const now = new Date();
    return now >= this.dateDebut && now <= this.dateFin;
});


evenementSchema.set("toJSON", { virtuals: true });
evenementSchema.set("toObject", { virtuals: true });


evenementSchema.index({ dateDebut: 1, dateFin: 1 });

export default mongoose.model("Evenement", evenementSchema);
