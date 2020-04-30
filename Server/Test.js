const http = require("http");
const fs = require("fs");
const database = require("./Database.js").Database;

exports.testServer = function(){
  let randomDrawings = [];
  for(let i=0; i < 10; i++){
    randomDrawings.push(randomDrawingData());
  }
  /*Testing if createaccount works and creates the appropriate data*/
  ServerResourceTest("/checkusername/", "POST", "Test", (response, data) => {
    if(response.statusCode !== 200){
      throw `CHECKUSERNAME RESPONDED WITH ${response.statusCode}, SHOULD'VE RESPONDED WITH 200`;
    }
    if(data !== "not taken"){
      throw `CHECKUSERNAME DID NOT RESPOND WITH "taken" TO USERNAME "Test" RESPONDED WITH: ${data}`;
    }
  });

  ServerResourceTest("/createaccount/", "POST", JSON.stringify({username: "Test", drawings: randomDrawings}), (response, data) => {
    setTimeout(() => {
      //#region createaccount
      if(response.statusCode !== 200){
        throw `CREATEACCOUNT RESPONDED WITH ${response.statusCode}, SHOULD'VE RESPONDED WITH 200`;
      }
      if(fs.existsSync("./data/Test") === false){
        throw `CREATEACCOUNT DIDN'T CREATE ./data/Test folder`
      }
      if(fs.existsSync("./data/Test/drawings") === false){
        throw `CREATEACCOUNT DIDN'T CREATE ./data/Test/drawings file`
      }
      if(fs.existsSync("./data/Test/NNData") === false){
        throw `CREATEACCOUNT DIDN'T CREATE ./data/Test/drawings file`
      }

      const drawingDataRecieved = fs.readFileSync("./data/Test/drawings").toString();
      const drawingDataSent = formatData(randomDrawings);

      const sentStrings = drawingDataSent.split("\n");
      const recievedStrings = drawingDataRecieved.split("\n");

      for(let string of sentStrings) {
        if(recievedStrings.find((value) => value === string) === undefined){
          throw `CREATEACCOUNT DIDN'T ADD DRAWING DATA PROPERLY: EXPECTED ${sentStrings} GOT: ${recievedStrings} error: ${string}`;
        }
      }
      console.log("SUCCESS: Createaccount test found 0 errors");
      //#endregion createaccount
      
      ServerResourceTest("/checkusername/", "POST", "Test", (response, data) => {
      if(response.statusCode !== 200){
        throw `CHECKUSERNAME RESPONDED WITH ${response.statusCode}, SHOULD'VE RESPONDED WITH 200`;
      }
      if(data !== "taken"){
        throw `CHECKUSERNAME DID NOT RESPOND WITH "taken" TO USERNAME "Test" RESPONDED WITH: ${data}`;
      }

      console.log("SUCCESS: checkusername test found 0 errors");
      });
      

      database.deleteUser("Test");
    }, 2500);
    
    
    
  });
}

/*Sends a http request to the server and runs a callback that acts as a test*/
ServerResourceTest = function(url, method, data, testCallback){

  const httpOptions = {
    path: url,
    method: method,
    port: 8000, 
    headers: {
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const request = http.request(httpOptions, (response) => {
    response.setEncoding('utf8');
    let responseBody = "";

    response.on('data', (chunk) => {
      responseBody += chunk;
    });
    response.on('end', () => {

      /*if testcallback exists, run it with response and data as input parameters*/
      if(testCallback !== undefined){
        testCallback(response, responseBody);
      }
    });
  });

  request.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  request.write(data)
  request.end();
}

function randomDrawingData(){
  const drawing = {xArray: [], yArray: [], timeStamps: [], gradArray: []};

  for(let i = 0; i < 100; i++){
    drawing.xArray.push(randomNumber(100));
    drawing.yArray.push(randomNumber(100));
    drawing.timeStamps.push(randomNumber(100));
    drawing.gradArray.push(randomNumber(100));
  }
  return drawing;
}


function formatData(randomDrawings){
  let dataString = "";
  for(let randomDrawing of randomDrawings){
    for (let i = 0; i < randomDrawing.xArray.length; i++) {
      dataString += `${randomDrawing.xArray[i]} ${randomDrawing.yArray[i]} ${randomDrawing.timeStamps[i]} ${randomDrawing.gradArray[i]}`;

      if (i <= randomDrawing.xArray.length-1) {
        dataString += " ";
      }
    }
    dataString += "\n";
  }
  return dataString;
}
const randomNumber = (a) => Math.floor(Math.random() * a);