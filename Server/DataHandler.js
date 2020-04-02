const fs = require("fs");
const readline = require("readline");

exports.DataHandler = class {
    constructor (fileLocation, coloumns=1200) {
        this.coloumns = coloumns;
        this.fileLocation = fileLocation;
        this.rows = null;
        PathCheck(fileLocation, coloumns);
    }

    /* Function to initialise class, this has to be async since we need to wait for LoadRows to finish.*/
    async init() {
        await LoadRows(this.fileLocation).then((result) => {
          this.rows = result;
        });   
    }

    /*Adds a data entry into ./submit/data in specified format*/
    async addEntry(entry) {

      await removeFirstLine(this.fileLocation);
      


    }
}

exports.JSONToData = function(dataJSONString) {

  const dataObject = JSON.parse(dataJSONString);
  let dataString = "";
  for (let i = 0; i < dataObject.xArray.length; i++) {
    dataString += `${dataObject.xArray[i]} ${dataObject.yArray[i]} ${dataObject.timeStamps[i]} ${dataObject.gradArray[i]}`; /* What actually goes into gradArray? What is the input?*/
    if (i <= dataObject.xArray.length-1) {
      dataString += " "; /*Adds a whitespace between*/
    }
  }
  return dataString;
}


async function removeFirstLine(fileLocation) {
  const promise = new Promise((resolve, reject) => {

    const interface = readline.createInterface({
    input: fs.createReadStream(fileLocation)
    })

    const output = fs.createWriteStream(fileLocation);
    let firstRemoved = false;

    interface.on("line", (line) => {

      if(!firstRemoved) {
        firstRemoved = true;

      } else {
      output.write(line + '\n')

      } 
    }).on("end", () => {
      interface.close();
      resolve();
    })
  });
  await promise;
}

/*Checks if the folder "submit" exists, if not, creates it, and runs FileLocCheck*/
function PathCheck(fileLocation, coloumns) { 
  if (fs.existsSync('./submit') === false) {
    fs.mkdirSync('./submit');
  }
  FileLocCheck(fileLocation, coloumns)
}   


/* Checks if the file exists */
function FileLocCheck(fileLocation, coloumns) {
  if (fs.existsSync(fileLocation)) {
    console.log("FILE LOCATED");
  }
  else {
    /*Creates the file if it does not exist*/
    console.log("FILE NOT LOCATED, CREATING FILE");
    fs.writeFileSync(fileLocation, `0 ${coloumns}\n`);
  }
}


async function LoadRows(fileLocation) {
  let returnData = 0; 
  const prom = new Promise((resolve, reject) => {

    let linenum = 0;
    const readlineInterface = readline.createInterface({
      input: fs.createReadStream(fileLocation)
    });

    readlineInterface.on("line", (input) => {
        if (linenum === 0) {
          linenum++;
          let FirstSpace = input.indexOf(' ');
          resolve(input.slice(0,FirstSpace));
        }
    });
    
    readlineInterface.on("end", () => {
      readlineInterface.close();
    }); 
  });

  await prom.then((val) => {
    console.log(`SlicedInput Val: ${val}`);
    returnData = val;
  }).catch((err) => {
    console.error(err);
  });

  return returnData;
}