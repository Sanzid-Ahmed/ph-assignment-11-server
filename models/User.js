const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String }, 
    role: { type: String, enum: ['hr', 'employee'], required: true },
    name: { type: String, required: true, trim: true },
    profileImage: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },


    companyName: { type: String, trim: true },
    companyLogo: { type: String },
    packageLimit: { type: Number, default: 5 }, 


    hrEmail: { type: String, trim: true, default: null },

    affiliationDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);