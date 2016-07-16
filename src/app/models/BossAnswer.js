import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  courseNo: {type: Number},
  lessonNo: {type: Number},
  bossNo: {type: Number},
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  audio: String,
  audios: [String],
  serverIds: [String],
  type: {type: String},
});

export default mongoose.model('BossAnswer', schema);
