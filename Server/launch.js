const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const JSONToData = require("./DataHandler.js").JSONToData;
const http = require("http");
const fs = require("fs");

const server = new Server(8000);
const NNData = new DataHandler("./submit/data", 1200);

function serve(req, res, resource) {
    /* Telling the server that there exist a resource such as (a get request, with FileLocation "./index.html"), with URL "/") Below is what the server should respond,
    * when recieving the GET request.*/ 
    /* Indicates that the Server are expexted to recieve a GET request from client, and respond with respondcode "200" and deliver the requested file */
    res.writeHead(200);
    res.write(fs.readFileSync(resource.fileLocation));
}



NNData.init().then(() => {
  let testNum = 0;
  server.addResource(new ServerResource("POST", "./submit/database.data", "/submit/", (req, res, resource) => {

  res.writeHead(200);

    let reqBody = '';
    req.on("data", (chunk) => {
      reqBody += chunk;
    });
    req.on("end", () => {
      console.log("Message recieved: " + reqBody);

      const dataString = JSONToData(reqBody);
      NNData.addEntry(dataString);
    });
  }));

  server.addResource(new ServerResource("GET", "../Website/index.html", "/", serve));
  server.addResource(new ServerResource("GET", "../Website/Scripts/canvas.js", "/Scripts/canvas.js", serve));
  server.addResource(new ServerResource("GET", "../Website/Style/index.css", "/Style/index.css", serve));
  server.addResource(new ServerResource("GET", "./testSite.html", "/test", (req, res) => {

    NNData.addEntry(`5 5 ${testNum++}`);
    
    res.writeHead(200);
    res.write(fs.readFileSync("../Website/index.html"));

  }));
  console.log("Rows: " + NNData.rows);
  server.start();

});