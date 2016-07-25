import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  name: { type: String, required: true },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'PostCategory',
  },
  state: { type: String }, // draft, published, archived
  publishedDate: { type: Date, index: true },
  content: {
    type: String
  },
});

schema.index({ name: 1, accountId: 1 }, { unique: true });

export default mongoose.model('Post', schema);
