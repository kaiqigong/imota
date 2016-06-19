import mongoose, { Schema } from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true
  },
  nickname: String,
  classe: String,
  learningTime: Number, // minutes
  totalLearningTime: Number, // minutes
  date: Date,
  todayHomeworkCount: {
    type: Number,
  },
});

schema.index({accountId: 1, date: -1}, { unique: true });

export default mongoose.model('LearningHistory', schema);
