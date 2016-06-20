import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  homeworkName: { type: String },
  courseNo: { type: Number },
  lessonNo: { type: Number },
  time: {type: Number },
  audio: { type: String },
  audios: [String],
  nickname: { type: String },
  serverId: { type: String },
  serverIds: [String],
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  learningHistory: {
    type: Schema.Types.ObjectId,
    ref: 'LearningHistory',
  },
});

export default mongoose.model('PronunciationHomework', schema);

