// models/Task.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const OfferSchema = new Schema({
  professional: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
}, { timestamps: true, _id: true });

const TaskSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true }, // text box
  comment: { type: String },
  dueDate: { type: Date },
  offers: [OfferSchema], 
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
