const {
  mongoose
} = require('./db');

/**
 * 触发
 */
var UserSchema = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
});

var userModel = mongoose.model('User', UserSchema);

module.exports = {
  createUser: (username, password) => {
    return new Promise((res, ret) => {
      userModel.create({
        username,
        password
      }, (err, doc) => {
        if (err) ret(err)
        res(doc)
      })
    })
  },
  loginAction: (username) => {
    return new Promise((res, ret) => {
      userModel.findOne({
        username: username
      }, (err, doc) => {
        if (err) ret(err)
        res(doc)
      })
    })
  }
}