const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const http = require("http");
const fs = require("fs");

const server = new Server(8000);


server.addResource(new ServerResource("POST", "/submit/", (req, res, resource) => {

  res.writeHead(200);

  let reqBody = '';
  req.on("data", (chunk) => {
    reqBody += chunk;
  });
  req.on("end", () => {
    console.log("Message recieved: " + reqBody);

    const dataString = JSONToData(reqBody);
    DataHandler.addEntry(dataString, "test");
  });
}));

server.addResource(ServerResource.Servable("../Website/index.html", "/"));
server.addResource(ServerResource.Servable("../Website/Scripts/canvas.js", "/Scripts/canvas.js"));
server.addResource(ServerResource.Servable("../Website/Style/index.css", "/Style/index.css"));