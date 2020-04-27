const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const Database = require("./Database.js").Database;
const http = require("http");
const fs = require("fs");

const server = new Server(8000);

server.addResource(new ServerResource("POST", "/submit/", (req, res) => {

  res.writeHead(200);

  readRequestBody(req).then((val) => {
    console.log("Message recieved: " + val);
    const dataString = JSONToData(val);
    DataHandler.addEntry(dataString, "test");
  });

}));

server.addResource(new ServerResource("POST", "/createaccount/", (req, res) => {
  readRequestBody(req).then((val) => {
    const body = JSON.parse(val);
    
    Database.createUser(body.username);

    for(let drawing in body.drawings){
      DataHandler.addEntry(drawing, body.username);
    }
  })
}));


server.addResource(ServerResource.Servable("../Website/index.html", "/"));
server.addResource(ServerResource.Servable("../Website/Scripts/canvas.js", "/Scripts/canvas.js"));
server.addResource(ServerResource.Servable("../Website/Style/index.css", "/Style/index.css"));




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