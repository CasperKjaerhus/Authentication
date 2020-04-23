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
        await CountRows(this.fileLocation).then((result) => {
          this.rows = result;
        });   
    }

    /*Adds a data entry into fileLocation*/
    async addEntry(entry) {
      let data;

      if (this.rows > 0) {
        data = `\n${entry}`;
      } else {
        data = entry;
      }

      fs.appendFile(this.fileLocation, data, (err) =>{
        console.log(`Error: ${err}`);
      })
      this.rows++;
    }

    static JSONToData(dataJSONString) {

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
}




async function CountRows(fileLocation) {
  let returnData = 0; 
  const prom = new Promise((resolve, reject) => {

    let linenum = 0;
    const readlineInterface = readline.createInterface({
      input: fs.createReadStream(fileLocation)
    });

    readlineInterface.on("line", (input) => {
      linenum++;
    });
    
    readlineInterface.on("end", () => {
      readlineInterface.close();
      resolve(linenum);
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