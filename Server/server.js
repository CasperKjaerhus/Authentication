const http = require("http");
const fs = require("fs");

class ServerResource {
  constructor (method, fileLocation, url, callback) {
    this.method = method;
    this.fileLocation = fileLocation;
    this.url = url;
    this.callback = callback;
  }     
}
class Server {
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
            }
          }


          break;

        case "PUT":
          
          break;

        default:  
          res.writeHead(404);
          break;
      }
    }).listen(this.port);
    console.log("Session started!");
  }

}


const server = new Server(8000);
server.addResource(new ServerResource("GET", "./index.html", "/", () => {}));
server.start();