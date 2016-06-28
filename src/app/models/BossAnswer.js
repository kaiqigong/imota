import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  courseNo: {type: Number},
  lessonNo: {type: Number},
  bossNo: {type: Number},
  userId: String,
  audio: String,
  // courseNo: { type: Number },
  // lessonNo: { type: Number },
  // time: {type: Number },
  // audio: { type: String },
  audios: [String],
  // nickname: { type: String },
  // serverId: { type: String },
  // serverIds: [String],
  type: {type: String},
});

export default mongoose.model('BossAnswer', schema);
