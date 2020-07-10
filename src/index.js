const getRawBody = require('raw-body');
const {
  md5,
  render,
  reqJson,
  jsonify
} = require("./utils");
const {
  loginAction,
  createUser
} = require("./schema/user");
const {
  getTrigger,
  createTrigger,
  deleteTrigger,
  getTriggers,
  updateTrigger
} = require("./schema/trigger");

/**
 * Login or Register
 */
const fc_login = async (username, password) => {
  let user = await loginAction(username)
  if (user) {
    if (user.password == md5(password)) {
      return {
        id: user.id,
        username: user.username
      }
    }
  } else {
    user = await createUser(username, md5(password))
    if (user && user.username)
      return {
        id: user._id,
        username: user.username
      }
  }
  return false
}
/**
 * Trigger
 */
const fc_trigger_get = async (creator, uuid) => {
  let doc = {}
  if (uuid)
    doc = await getTrigger(uuid, creator)
  else
    doc = await getTriggers(creator)
  return doc
}
const fc_trigger_update = async (creator, uuid, data) => {
  let doc = {}
  let pushers = []
  if (data.status) doc['status'] = data.status
  if (data.name) doc['name'] = data.name
  if (data.receive) doc['receive'] = data.receive
  if (data.pushers) {
    data.pushers.forEach(p => {
      if (p.url && p.body)
        pushers.push({
          url: p.url,
          body: p.body
        })
    })
  }
  if (pushers.length > 0)
    doc['pushers'] = data.pushers
  return await updateTrigger(uuid, creator, doc)
}
const fc_trigger_create = async (creator, data) => {
  let pushers = [];
  if (!data.pushers || !data.name) {
    return false
  }
  data.pushers.forEach(p => {
    if (p.url && p.body)
      pushers.push({
        url: p.url,
        body: p.body
      })
  })
  if (pushers.length == 0) {
    return false
  }
  let doc = {
    receive: data.receive,
    name: data.name,
    pushers: pushers,
  }
  return await createTrigger(creator, doc)
}
const fc_trigger_delete = async (creator, uuid) => {
  return await deleteTrigger(uuid, creator)
}
/**
 * Webhook
 */
const fc_trigger_webhook = async (uuid, data) => {
  let doc = await getTrigger(uuid)
  if (!doc)
    return false
  doc.pushers.forEach(p => {
    let res = render(p.body, data)
    if (res)
      reqJson(p.url, res)
  })
}

module.exports.handler = async (req, resp, context) => {
  try {

    let body = {}
    if (req.method == "POST" || req.method == "PUT")
      body = JSON.parse(await getRawBody(req))

    if (req.method == "GET" && req.path == "/") {
      resp.setHeader('content-type', 'text/html; charset=utf-8');
      resp.send("<h1>Hello world</h1>");
      return
    }

    resp.setHeader('content-type', 'application/json; charset=utf-8');

    if (req.path.startsWith("/v")) {
      let res = await fc_trigger_webhook(req.path.substr(3), body)
      resp.send(jsonify(res))
      return
    }

    if (req.path == "/login") {
      let data = await fc_login(body.username, body.password);
      if (data) {
        resp.send(jsonify(data))
      } else {
        resp.send(jsonify("", -1, "error"))
      }
      return
    }

    let creator = req.headers.authorization;
    if (!creator) {
      resp.send(jsonify("", -1, "not auth"))
      return
    }

    let uuid = req.path.substr(9);
    var res = {}

    if (req.path.startsWith("/trigger")) {
      switch (req.method) {
        case "GET":
          res = await fc_trigger_get(creator, uuid)
          break;
        case "DELETE":
          res = await fc_trigger_delete(creator, uuid)
          break;
        case "PUT":
          res = await fc_trigger_create(creator, body)
          break;
        case "POST":
          res = await fc_trigger_update(creator, uuid, body)
          break;
      }
      if (res) {
        resp.send(jsonify(res))
      } else {
        resp.send(jsonify("", -1, res))
      }
      return
    }
  } catch (err) {
    resp.send(jsonify("", -1, err))
    return
  }

  resp.send(jsonify("", -1, "error"))

}