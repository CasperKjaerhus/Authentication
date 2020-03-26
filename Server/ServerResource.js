exports.ServerResource = class {
  constructor (method, fileLocation, url, callback = (req, res) => {}) {
    this.method = method;
    this.fileLocation = fileLocation;
    this.url = url;
    this.callback = callback;
  }     
}