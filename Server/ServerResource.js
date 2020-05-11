const fs = require("fs")

exports.ServerResource = class {
  constructor (method, url, callback = (req, res) => {}) {
    this.method = method;
    this.url = url;
    this.callback = callback;
  }

  static Servable(filelocation="", url) {
    return new this("GET", url, (req, res) => {
      let headers = {};
      if(filelocation.endsWith(".js") === true){
        headers["Content-Type"] = 'application/javascript';
      }

      res.writeHead(200, headers);
      res.write(fs.readFileSync(filelocation));
    });
  }
}