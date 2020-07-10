const crypto = require('crypto');
const request = require('request');

const jsonify = (data = "", code = 0, msg = "success") => {
  return JSON.stringify({
    code: code,
    msg: msg,
    data: data
  })
}

const reqJson = (url, data) => {
  console.log("url  =", url)
  console.log("data =", data)
  request({
    url: url,
    method: "POST",
    json: true,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.parse(data)
  }, (err, resp, body) => {
    if (!err && resp.statusCode == 200) {
      console.log(body)
    }
  });
}

const md5 = (v) => {
  let m = crypto.createHash('md5');
  return m.update(v).digest('hex')
}

const render = (template, receive) => {
  const regex = /\{\{(.+?)\}\}/mg;
  let keys = [];
  while ((m = regex.exec(template)) !== null) {
    keys.push(m[1])
  }
  keys.forEach(key => {
    try {
      let tmp = receive;
      key.split(".").forEach(k => {
        tmp = tmp[k]
      })
      if (tmp != undefined) {
        template = template.replace(new RegExp("({{" + key + "}})", "g"), tmp);
      }
    } catch (e) {}
  })
  return template
}

module.exports.md5 = md5
module.exports.render = render
module.exports.reqJson = reqJson
module.exports.jsonify = jsonify