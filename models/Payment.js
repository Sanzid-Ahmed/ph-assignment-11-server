const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
    hrId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    hrEmail: {
        type: String,
        required: true,
        trim: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number, 
        required: true,
    },
    package: {
        type: Number, 
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Succeeded', 'Pending', 'Failed'],
        default: 'Succeeded',
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);