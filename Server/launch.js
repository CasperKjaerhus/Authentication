const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const Database = require("./Database.js").Database;
const http = require("http");
const fs = require("fs");
const {testServer} = require("./Test.js");

const server = new Server(8000);

/*Resource to create an account from the client */
server.addResource(new ServerResource("POST", "/createaccount/", (req, res) => {
  readRequestBody(req).then((val) => {
    const body = JSON.parse(val);
    if(Database.DoesUserExist(body.username) === false){
      res.writeHead(200);
      Database.createUser(body.username);

      for(let drawing of body.drawings){
        DataHandler.addEntry(drawing, body.username);
      }
      res.end();
    }else {
      res.writeHead(403)
      res.write("taken", () => res.end()); 
    }
  });
}));

/*Resource to check username availability */
server.addResource(new ServerResource("POST", "/checkusername/", (req, res) => {
  readRequestBody(req).then((val) => {
    res.writeHead(200);
    if(Database.DoesUserExist(val) === true){
      res.write("taken", () => res.end());
    }else {
      res.write("not taken", () => res.end());
    }
    
  });
}));

server.addResource(ServerResource.Servable("../Website/index.html", "/"));
server.addResource(ServerResource.Servable("../Website/Scripts/canvas.js", "/Scripts/canvas.js"));
server.addResource(ServerResource.Servable("../Website/Style/index.css", "/Style/index.css"));

server.start();

//testServer(); // Enable this for testing! :)

function readRequestBody(req){
  return new Promise((resolve, reject) => {
    let reqBody = '';
    req.on("data", (chunk) => {
      reqBody += chunk;
    });
    req.on("end", () => {
      resolve(reqBody);
    });
  })

}