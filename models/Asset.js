const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssetSchema = new Schema({
    assetName: { type: String, required: true, trim: true },
    assetType: { type: String, enum: ['Returnable', 'Non-returnable'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    availableQuantity: { type: Number, required: true, min: 0 },
    
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyEmail: { type: String, required: true, trim: true },

    additionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Operational', 'Maintenance', 'Retired'], default: 'Operational' }
});

AssetSchema.pre('save', function(next) {
    if (this.isNew) {
        this.availableQuantity = this.quantity; 
    }
    next();
});

module.exports = mongoose.model('Asset', AssetSchema);