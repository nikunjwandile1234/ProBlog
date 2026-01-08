

const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/auth");

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  salt: String,
  password: String,
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

userSchema.pre("save", function () {
  if (!this.isModified("password")) return;
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", salt).update(this.password).digest("hex");
  this.salt = salt;
  this.password = hash;
});

userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) return null;
  const hash = createHmac("sha256", user.salt).update(password).digest("hex");
  if (hash !== user.password) return null;
  return createTokenForUser(user);
};

module.exports = mongoose.model("User", userSchema);

