const http = require("http");
const fs = require("fs");
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

      switch (req.method) {
        case "GET":

          const getResources = this.resources.filter((value) => {
            if (value.method === "GET") {
              return true;
            }
            else {
              return false;
            }
          });

          for (let resource of getResources) {
            if (req.url === resource.url) {
              console.log(`FOUND RESOURCE MATCH: ${resource}`);
              res.writeHead(200);
              res.write(fs.readFileSync(resource.fileLocation));
              res.end();
              return;
            }
          }
          break;

        case "PUT":
          
          break;

        default:  
          break;
      }
      res.writeHead(404);
      //res.write(fs.readFileSync(404_PAGE_FILE_LOCATION));  TODO: 404 side in case 
      res.end();
    }).listen(this.port);
    console.log("Session started!");
  }
}