import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  is_public: { type: Boolean, default: true },
  tags: [String],
  attachments: [{
    name: String,
    type: String,
    size: Number,
    data: String
  }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    text: String,
    created_at: { type: Date, default: Date.now }
  }],
  shared_with: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, default: 'view' },
    shared_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

noteSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

noteSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Note = mongoose.model('Note', noteSchema);
export default Note;
