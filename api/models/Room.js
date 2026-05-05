import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  subject: { type: String, default: '' },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher_name: { type: String, required: true },
  join_code: { type: String, required: true, unique: true },
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    email: String,
    joined_at: { type: Date, default: Date.now }
  }],
  shared_notes: [{
    note_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    shared_at: { type: Date, default: Date.now },
    shared_by: String
  }],
  shared_files: [{
    file_id: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    shared_at: { type: Date, default: Date.now },
    shared_by: String
  }],
  created_at: { type: Date, default: Date.now }
});

roomSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

roomSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
