const fs = require("fs");
const readline = require("readline");

exports.DataHandler = class {
  constructor () {}

    /*Adds a data entry into fileLocation*/
  static async addEntry(entry, username) {
    let data = `${entry}\n`;
    let fileLocation = `./data/${username}/drawings.txt`;

    UserPathCheck(`./data/${username}`);

    fs.appendFile(fileLocation, data, (err) => {
      console.log(`Error: ${err}`);
    });
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

  static async prepareNNData(username, coloumns){
    UserPathCheck(`./data/${username}`);
    let rows;
    
    /*receives the amount of rows/lines and uses this alongside the amount of coloums to write the start of the NNData file*/
    await CountRows(`./data/${username}/drawings.txt`).then((val) => rows = val);
    console.log("got here");

    fs.appendFile(`./data/${username}/NNData.txt`, `${rows} ${coloumns}\n`, (err) => console.log(err));
    
    
    const prom = new Promise((resolve, reject) => {

      const readlineInterface = readline.createInterface({
        input: fs.createReadStream(`./data/${username}/drawings.txt`)
      });
      /*Line event fires when a line is read from the file, and is used to copy to another file*/
      readlineInterface.on("line", (input) => {
        fs.appendFile(`./data/${username}/NNData.txt`, input+"\n", (err) => console.log(err))
      });
      
      /*Close event fires upon end of file and is used to delete the last new line and resolves the promise*/
      readlineInterface.on("close", () => {
        fs.stat(`./data/${username}/NNData.txt`, (err, stats) => {
          fs.truncate(`./data/${username}/NNData.txt`, stats.size - 1, (err) => {});
        })
        resolve();
      });
    })
    await prom.then(() => console.log(`Done writing from [./data/${username}/drawings.txt] to [./data/${username}/NNData.txt]`));
  }
}

/*checks if a folder with the users username exists*/
function UserPathCheck(folderLocation){
  if(fs.existsSync(folderLocation) === false) {
    console.log("User folder does not exist")
    fs.mkdirSync(folderLocation);
    console.log("User folder created");

    Userfilecheck(folderLocation, "drawings.txt");
    Userfilecheck(folderLocation, "NNData.txt");
  }
  
}
function Userfilecheck(folderLocation, filename){
  if(fs.existsSync(`${folderLocation}/${filename}`) === false) {
    console.log(`${filename} does not exist`)
    fs.writeFileSync(`${folderLocation}/${filename}`, "");
    console.log(`${filename} created`);
  }
}



/*The amount of rows/lines in the document is counted and then the number is returned*/
async function CountRows(fileLocation) {
  let returnData = 0; 
  const prom = new Promise((resolve, reject) => {

    let linenum = 0;
    const readlineInterface = readline.createInterface({
      input: fs.createReadStream(fileLocation)
    });

    readlineInterface.on("line", (input) => {
      console.log(linenum);
      linenum++;
    });
    
    readlineInterface.on("close", () => {
      console.log("test");
      resolve(linenum);
    }); 
  });

  await prom.then((val) => {
    returnData = val;
  }).catch((err) => {
    console.error(err);
  });

  return returnData;
}