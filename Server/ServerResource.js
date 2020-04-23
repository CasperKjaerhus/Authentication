const fs = require("fs")

exports.ServerResource = class {
  constructor (method, url, callback = (req, res) => {}) {
    this.method = method;
    this.url = url;
    this.callback = callback;
  }

  static Servable(filelocation, url) {
    return new this("GET", url, (req, res) => {
      res.writeHead(200);
      res.write(fs.readFileSync(filelocation));
    });
  }
}