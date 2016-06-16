import mongoose, { Schema } from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
    required: true
  },
  url: String,
});

export default mongoose.model('Beat', schema);
