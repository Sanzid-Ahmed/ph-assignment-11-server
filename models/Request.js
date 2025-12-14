const mongoose = require('mongoose');
const { Schema } = mongoose;

const RequestSchema = new Schema({
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetName: { type: String, required: true },
    assetType: { type: String, enum: ['Returnable', 'Non-returnable'], required: true },
    
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requesterEmail: { type: String, required: true, trim: true },
    requesterName: { type: String, required: true },
    
    hrEmail: { type: String, required: true }, 
    
    requestDate: { type: Date, default: Date.now },
    requestReturnDate: { 
        type: Date,
        required: function() { return this.assetType === 'Returnable'; },
        default: null,
    },
    
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Returned'], default: 'Pending' },
    approvalDate: { type: Date, default: null },
    returnDate: { type: Date, default: null },
    hrNote: { type: String, default: '' },
    isCurrentlyHolding: { type: Boolean, default: false } 
});

module.exports = mongoose.model('Request', RequestSchema);