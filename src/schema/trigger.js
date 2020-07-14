const {
  mongoose
} = require('./db');
const uuidv4 = require('uuid/v4')

/**
 * 触发
 */
var TriggerSchema = new mongoose.Schema({
  uuid: {
    type: String
  },
  creator: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String
  },
  status: {
    type: Boolean
  },
  receive: {
    type: String
  },
  pushers: [{
    name: {
      type: String
    },
    url: {
      type: String
    },
    body: {
      type: String
    }
  }]
});

var triggerModel = mongoose.model('Trigger', TriggerSchema);

module.exports = {
  createTrigger: (creator, doc) => {
    doc['uuid'] = uuidv4()
    doc['status'] = true
    doc['creator'] = creator
    return new Promise((res, rej) => {
      triggerModel.create(doc, (err, doc) => {
        if (err) rej(err)
        res(doc)
      })
    })
  },
  getTrigger: (uuid, creator = false) => {
    return new Promise((res, rej) => {
      var q = {
        uuid
      }
      if (!!creator) q['creator'] = creator
      triggerModel.findOne(q, (err, doc) => {
        if (err) rej(err)
        res(doc)
      })
    })
  },
  getTriggers: (creator) => {
    return new Promise((res, rej) => {
      triggerModel.find({
        creator
      }, (err, doc) => {
        if (err) rej(err)
        res(doc)
      })
    })
  },
  updateTrigger: (uuid, creator, doc) => {
    return new Promise((res, rej) => {
      triggerModel.updateOne({
        uuid,
        creator
      }, doc, (err, w) => {
        if (err) rej(err)
        res(w)
      })
    })
  },
  deleteTrigger: (uuid, creator) => {
    return new Promise((res, rej) => {
      triggerModel.deleteOne({
        uuid,
        creator
      }, (err, r) => {
        if (err) rej(err)
        res(r)
      })
    })
  }
}