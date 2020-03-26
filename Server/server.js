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

      switch (req.method) {
        case "GET":
          /* The resources are filtered so that only the valid resources are being used */
          /*const getResources = this.resources.filter((value) => {
            if (value.method === "GET") {
              return true;
            }
            else { //Hvis slettes måske tilføj ovenstående kommentar nedenfor. PS jeg pisser lige
              return false;
            }
          });*/
          /* With the list of valid resources, the url's of the different resources are compared to the requested url, so the correct resource will be used */
          for (let resource of this.resources) {
            if (req.url === resource.url && req.method === resource.method) {
              console.log(`FOUND RESOURCE MATCH: ${resource}`);
              
              /**/
              resource.callback(req, res, resource);

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