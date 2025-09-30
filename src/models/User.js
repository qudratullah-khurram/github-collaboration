const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
name: {
type: String,
required: true,
trim: true,
},
email: {
type: String,
required: true,
unique: true,
trim: true,
},
passwordHash: {
type: String,
required: true,
},
isProfessional: {
type: Boolean,
default: false,
required: true,
},
});

module.exports = mongoose.model('User', UserSchema);