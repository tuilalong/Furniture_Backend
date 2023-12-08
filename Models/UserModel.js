import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    isAdmin: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//login
// userSchema.methods.matchPassword = async function (enterPassword) {
//   return await bcrypt.compare(enterPassword, this.password);
// };

userSchema.methods.comparePassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

//register;
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") && !this.isModified("phone")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
