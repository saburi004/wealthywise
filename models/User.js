import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Delete the existing model if it exists
delete mongoose.connection.models.User;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please fill a valid 10-digit phone number']
  },
  panCardNumber: {
    type: String,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please fill a valid PAN card number']
  },
  dateOfBirth: {
    type: Date
  },
  bankName: {
    type: String,
    trim: true
  },
  fullName: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { strict: false });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


const User = mongoose.model('User', userSchema);
export default User;