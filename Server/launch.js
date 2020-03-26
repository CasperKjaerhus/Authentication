const {Server} = require("./server.js");
const {ServerResource} = require("./ServerResource.js");

const server = new Server(8000);

server.addResource(new ServerResource("GET", "./index.html", "/", () => {}));

server.start();