const Server = require("./server.js").Server;
const ServerResource = require("./ServerResource.js").ServerResource;
const DataHandler = require("./DataHandler.js").DataHandler;
const Database = require("./Database.js").Database;
const http = require("http");
const fs = require("fs");
const neuralnet = require("./neuralnet_src");


const server = new Server(8000);

if(fs.existsSync("./data") === false){
  fs.mkdirSync(`./data`);
}
/*TODO: Test if Matrix.fill actually works as intended*/
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
  
    let Input = neuralnet.loadMatrix(`./data/${body.username}/NNData`);

    let learningInput = Input.getRow(2);

    for (let i = 3; i <= Input.rows; i++) {
      learningInput = learningInput.addMatrix(Input.getRow(i));
    }

    let learningOutput = new neuralnet.Matrix(learningInput.rows, 1).fill(1);
    
    learningInput = learningInput.addMatrix(wrongDrawings).normalize();
    learningOutput = learningOutput.addMatrix(wrongDrawingOutput);

    const personalNeuralNetwork = new neuralnet.MLP_Net(learningInput.cols, 10, 1).gaussinit(0.01, 0.4);

    console.log(`Training ${body.username} personal neural network`);

    await personalNeuralNetwork.train(1000, learningInput, learningOutput, 0.05);

    while(personalNeuralNetwork.decide(Input.getRow(1)).getElement(1,1) < 0.9){
      console.log("Training some more: Test returned: " + personalNeuralNetwork.decide(Input.getRow(1)).getElement(1,1));
      await personalNeuralNetwork.train(10, learningInput, learningOutput, 0.02);
    }
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

  if (Database.DoesUserExist(requestBody.username) === true) {
    const personalNeuralNetwork = neuralnet.loadMLPNet(`./data/${requestBody.username}/`);

    let input = new neuralnet.Matrix(1, 400);
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

    const wrongDrawings = neuralnet.loadMatrix("./data/wrongdrawings/NNData");
    input = input.normalizeThrough(wrongDrawings);

    const output = personalNeuralNetwork.decide(input);

    input.print();
    output.print();

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
