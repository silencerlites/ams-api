import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    sequence: { type: Number, required: true, default: 0 }
  },
  {
    versionKey: false
  }
);

const Counter = mongoose.model('Counter', counterSchema, 'counters');
export default Counter;