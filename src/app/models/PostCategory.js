import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  name: { type: String, required: true, index: true },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
});

schema.index({ name: 1, accountId: 1 }, { unique: true });

export default mongoose.model('PostCategory', schema);
