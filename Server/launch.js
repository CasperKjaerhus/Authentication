const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const Database = require("./Database.js").Database;
const http = require("http");
const fs = require("fs");
const {testServer} = require("./Test.js");
const neuralnet = require("./neuralnet_src");


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

/*Adding pages and scripts that the client can load*/
server.addResource(ServerResource.Servable("../Website/index.html", "/"));
server.addResource(ServerResource.Servable("../Website/login.html", "/login"));
server.addResource(ServerResource.Servable("../Website/account.html", "/account"));
server.addResource(ServerResource.Servable("../Website/Scripts/canvas_module.js", "/Scripts/canvas_module.js"));
server.addResource(ServerResource.Servable("../Website/Scripts/login.js", "/Scripts/login.js"));
server.addResource(ServerResource.Servable("../Website/Scripts/account.js", "/Scripts/account.js"));
server.addResource(ServerResource.Servable("../Website/Scripts/utility.js", "/Scripts/utility.js"));
server.addResource(ServerResource.Servable("../Website/Style/index.css", "/Style/index.css"));

server.start();

server.addResource(new ServerResource("GET", "/startNN/", async (req, res) => {
  const inLearningMat = neuralnet.loadMatrix("./data/Test/inLearning.txt");
  const outLearningMat = neuralnet.loadMatrix("./data/Test/outLearning.txt");

  const inLearningMatNorm = inLearningMat.normalize();
  const inTest = neuralnet.loadMatrix("./data/Test/inTst.txt").normalizeThrough(inLearningMat);

  const outTest = neuralnet.loadMatrix("./data/Test/outTst.txt");

  const neuralnetwork = new neuralnet.MLP_Net(inLearningMat.cols, 6, outLearningMat.cols, 0.0, 0.4).gaussinit();

  console.log("Training...");
  await neuralnetwork.train(10000, inLearningMatNorm, outLearningMat, 0.02);
  console.log("finished training!");
  let numberOfErrors = 0;

  for(let i = 1; i <= inTest.rows; i++){

    const valueMat = neuralnetwork.decide(inTest.getRow(i));

    if(neuralnet.Matrix.compare(valueMat, outTest.getRow(i), 0.2) === false){
      numberOfErrors++;
    }
  }

  res.writeHead(200);
  res.write("Number of errors: " + numberOfErrors);
  res.end();
}));
/*Neuralnet api testing*/






//testServer(); // Enable this for testing! :)

/* Function that resolves to clientrequest body */
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