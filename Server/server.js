const http = require("http");
const fs = require("fs");

/* This class sets "port" to a default value of 8000 and creates an empty array "resources", that will be used to contain/hold all the server resources */
exports.Server = class {
  constructor (port=8000) {
    this.port = port;
    this.resources = [];
  }

  addResource (resource) {
    this.resources.push(resource);
  }

  start() {
    http.createServer((req, res) => {

      console.log(`REQUEST RECIEVED: {method: '${req.method}' url: '${req.url}}'`);
      let resourceFound = false;
      /* The "for-loop" iterates over the resource array, and chooses the one, which is requested. */

      for (let resource of this.resources) {
        if (req.method === resource.method && req.url === resource.url) {
          resourceFound = true;
            
          /*Callback determines what resource funktion is used (if a resource exists under launch.js the function of said resource is used)*/
          resource.callback(req, res, resource);
        }
      }     
      
      if (!resourceFound) {
        res.writeHead(404);
        //res.write(fs.readFileSync(404_PAGE_FILE_LOCATION));  TODO: 404 webpage in case 
        res.end();
      }
      

    }).listen(this.port);
    console.log("Session started!");
  }
}