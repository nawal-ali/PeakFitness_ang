const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Regular expression for email validation
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: { type: String, required: true },
  //isVerified: { type: Boolean, default: false },
  // verificationToken: { type: String },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  weight: { type: Number, default: null },
  height: { type: Number, default: null },
  gender: { type: String, enum: ["male", "female"], default: null },
  age: { type: Number, default: null },
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Articles'
  }]
});


const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References User model
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Fitness Data Model (new)
const FitnessDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: { type: Number, required: true }, // kg
  height: { type: Number, required: true }, // cm
  age: { type: Number },
  gender: {
    type: String,
    enum: ["male", "female"]
  },
  bmi: { type: Number },
  calories: { type: Number },
  idealWeight: { type: Number },
  bodyFat: { type: Number }
}, { timestamps: true });

// Articles Schema 
const ArticlesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coverImg: {
    url: { type: String, required: true },
  },
  desc: { type: String, required: true },
  content: [
    {
      subtitle: {
        type: String,
        required: false
      },
      paragraphs: [
        {
          type: String,
          required: true
        }
      ], images: [
        {
          url: String,
          caption: String
        }
      ]
    }
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // save: { type: Boolean, default: false },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const User = mongoose.model('User', UserSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const FitnessData = mongoose.model('FitnessData', FitnessDataSchema);
const Article = mongoose.model('Article', ArticlesSchema);

module.exports = {
  User,
  Comment,
  FitnessData,
  Article
};
