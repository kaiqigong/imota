import mongoose from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  courseNo: { type: Number },
  lessonNo: { type: Number },
  sentenceNo: {type: Number },
  english: { type: String },
  chinese: { type: String },
  audio: String,
  duration: Number, // 音频时长，秒
});

export default mongoose.model('Sentence', schema);
