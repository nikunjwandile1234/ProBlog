const JWT = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;


function createTokenForUser(user) {
  return JWT.sign({
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role
  }, SECRET);
}

function validateToken(token) {
  return JWT.verify(token, SECRET);
}

module.exports = { createTokenForUser, validateToken };


