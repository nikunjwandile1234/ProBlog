const JWT = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "devsecret123";

function createTokenForUser(user) {
  return JWT.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    SECRET,
    { expiresIn: "7d" }
  );
}

function validateToken(token) {
  return JWT.verify(token, SECRET);
}

module.exports = { createTokenForUser, validateToken };

