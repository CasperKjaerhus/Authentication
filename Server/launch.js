const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const Database = require("./Database.js").Database;
const http = require("http");
const fs = require("fs");
const {testServer} = require("./Test.js");
const neuralnet = require("./neuralnet_src");


const server = new Server(8000);

if(fs.existsSync("./data") === false){
  fs.mkdirSync(`./data`);
}

/*Resource to create an account from the client */
server.addResource(new ServerResource("POST", "/createaccount/", async (req, res) => {
  if (Database.DoesUserExist("wrongdrawings") === false){
    Database.createUser("wrongdrawings");
  }
  const body = JSON.parse(await readRequestBody(req));
  if (Database.DoesUserExist(body.username) === false) {
    res.writeHead(200);
    Database.createUser(body.username);

    for (let drawing of body.drawings) {
      DataHandler.addEntry(drawing, body.username);
    }

    await DataHandler.prepareNNData(body.username, 400);
    await DataHandler.prepareNNData("wrongdrawings", 400);

    const wrongDrawings = neuralnet.loadMatrix("./data/wrongdrawings/NNData");
    const wrongDrawingOutput = new neuralnet.Matrix(wrongDrawings.rows, 1).fill(0);

    let learningInput = neuralnet.loadMatrix(`./data/${body.username}/NNData`);
    let learningOutput = new neuralnet.Matrix(learningInput.rows, 1).fill(1);
    
    learningInput = learningInput.addMatrix(wrongDrawings).normalize();
    learningOutput = learningOutput.addMatrix(wrongDrawingOutput);

    const personalNeuralNetwork = new neuralnet.MLP_Net(learningInput.cols, 16, 1).gaussinit();

    console.log(`Training ${body.username} personal neural network`);

    await personalNeuralNetwork.train(1000, learningInput, learningOutput, 0.02);

    console.log(`finished training ${body.username}'s personal network!`);

    personalNeuralNetwork.saveToFile(`./data/${body.username}/`);

    res.end();
  } else {
    res.writeHead(403)
    res.write("taken", () => res.end()); 
  }
}));

server.addResource(new ServerResource("POST", "/submit", async (req,res) => {
  const requestBody = JSON.parse(await readRequestBody(req));

  if(Database.DoesUserExist(requestBody.username) === true){
    const personalNeuralNetwork = neuralnet.loadMLPNet(`./data/${requestBody.username}/`);

    const input = new neuralnet.Matrix(1, 400);

    /*Input drawing data into matrix*/
    let j = 1;
    for(let x of requestBody.drawing.xArray){
      input.setElement(1, j, x);
      j += 4;
    }
    j = 2;
    for(let y of requestBody.drawing.yArray){
      input.setElement(1, j, y);
      j += 4;
    }
    j = 3;
    for(let velocity of requestBody.drawing.velocities){
      input.setElement(1, j, velocity);
      j += 4;
    }
    j = 4;
    for(let gradient of requestBody.drawing.gradients){
      input.setElement(1, j, gradient);
      j += 4;
    }

    const output = personalNeuralNetwork.decide(input);
    console.log(output.print());
    if(output.getElement(1,1) > 0.8){
      res.writeHead(200);
      res.write("LOGGED IN");
      res.end();
    } else {
      res.writeHead(403);
      res.write("Invalid login");
      res.end();
    }

  } else {
    res.writeHead(403);
    res.write("Invalid login");
    res.end();
  }

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
server.addResource(ServerResource.Servable("../Website/kickstart.html", "/kickstart"));

server.start();

server.addResource(new ServerResource("GET", "/startnn", async (req, res) => {
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
server.addResource(new ServerResource("POST", "/submitkickstart", async (req, res) => {
  if(Database.DoesUserExist("kickstart") === false){
    Database.createUser("kickstart");
  }
  if (Database.DoesUserExist("wrongdrawings") === false){
    Database.createUser("wrongdrawings");
  }
  const requestBody = JSON.parse(await readRequestBody(req));
  console.log(`recieved drawing with xArray.length: ${requestBody.xArray.length} yArray.length: ${requestBody.yArray.length} velocities.length: ${requestBody.velocities.length} gradients.length: ${requestBody.gradients.length}`);
  DataHandler.addEntry(requestBody, "kickstart");

  res.writeHead(200);
  res.end();
}));


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