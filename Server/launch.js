const {Server} = require("./server.js");
const {ServerResource} = require("./ServerResource.js");
const fs = require("fs");

const server = new Server(8000);

function serve(req, res, resource){
    res.writeHead(200);
    res.write(fs.readFileSync(resource.fileLocation));
}

server.addResource(new ServerResource("GET", "../Website/index.html", "/", (req, res, resource) => {
    /* Telling the server that there exist a resource such as (a get request, with FileLocation "./index.html"), with URL "/") Below is what the server should respond,
    * when recieving the GET request.*/ 
    /*Indicates that the Server are expexted to recieve a GET request from client, and respond with respondcode "200" and deliver the requested file */
    res.writeHead(200);
    res.write(fs.readFileSync(resource.fileLocation));

}));

server.addResource(new ServerResource("GET", "../Website/Scripts/canvas.js", "/Scripts/canvas.js", serve));
server.addResource(new ServerResource("GET", "../Website/Style/index.css", "/Style/index.css", serve));

server.start();