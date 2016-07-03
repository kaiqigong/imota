import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  courseNo: {type: Number},
  lessonNo: {type: Number},
  userId: String,
  audio: String,
  serverIds: [String],
  type: {type: String},
});

export default mongoose.model('BossWork', schema);
