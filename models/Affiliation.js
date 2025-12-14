const mongoose = require('mongoose');
const { Schema } = mongoose;

const AffiliationSchema = new Schema({
    hrEmail: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
    },
    companyName: {
        type: String,
        required: true,
        trim: true,
    },
    hrId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentEmployeeCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    packageLimit: {
        type: Number,
        default: 5, 
        min: 1,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Affiliation', AffiliationSchema);