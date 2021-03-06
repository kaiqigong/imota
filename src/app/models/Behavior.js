import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';

const schema = BaseSchema.extend({
  ip: { type: String },
  ua: { type: String },
  browser: { type: Object },
  engine: {type: Object },
  os: {type: Object },
  device: {type: Object },
  session: { type: String },
  scope: { type: String },
  action: { type: String },
  value: { type: String },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'account',
  },
  referer: { type: String },
});

export default mongoose.model('Behavior', schema);
