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

      console.log(`REQUEST RECIEVED:\n\tmethod: ${req.method}\n\turl: ${req.url}`);
      
      /* The "for-loop" iterates over the resource array, and chooses the one, which is requested. */
      
      for (let resource of this.resources) {
        if (req.method === resource.method && req.url === resource.url) {
          console.log(`FOUND RESOURCE MATCH: ${resource}`);
            
          /*The resources callback is then used to figure out the appropriate response*/
          resource.callback(req, res, resource);

          res.end();
          return;
        }
      }     
          
      res.writeHead(404);
      //res.write(fs.readFileSync(404_PAGE_FILE_LOCATION));  TODO: 404 webpage in case 
      res.end();

    }).listen(this.port);
    console.log("Session started!");
  }
}