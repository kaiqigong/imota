import mongoose, { Schema } from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true
  },
  learningTime: Number, // minutes
  date: Date,
});

schema.index({accountId: 1, date: -1}, { unique: true });

export default mongoose.model('LearningHistory', schema);
