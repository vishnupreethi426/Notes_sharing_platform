import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  file_type_category: { type: String, default: 'other' },
  data: { type: String, required: true }, // Base64 or URL
  upload_date: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null }
});

fileSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

fileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const File = mongoose.model('File', fileSchema);
export default File;
