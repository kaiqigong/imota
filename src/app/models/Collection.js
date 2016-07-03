import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';
import mongooseHistory from 'mongoose-history';

const schema = BaseSchema.extend({
  courseNo: { type: Number, required: true },
  lessonNo: { type: Number, required: true },
  sentenceNo: { type: Number, required: true },
  type: { type: String, required: true },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
});

schema.plugin(mongooseHistory);

export default mongoose.model('Collection', schema);
