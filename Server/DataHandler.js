const fs = require("fs");
const readline = require("readline");
const Database = require("./Database.js").Database
exports.DataHandler = class {
  constructor () {}

    /*Adds a data entry into fileLocation*/
  static async addEntry(entry, username) {
    let data = `${JSONToData(entry)}\n`;
    let fileLocation = `./data/${username}/drawings`;
    if (Database.DoesUserExist(username)) {
      if (entry.correctDrawing === true) {
        fs.appendFile(fileLocation, data, (err) => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        fs.appendFile("./data/wrongdrawings/drawings", data, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    } else {
      console.log(`Error: ${username} does not exist!`);
    }
  }

  static async prepareNNData(username, coloumns){
    /*receives the amount of rows/lines and uses this alongside the amount of coloums to write the start of the NNData file*/
    let rows = await CountRows(`./data/${username}/drawings`);

    /*Deletes contents of NNData if there is one*/
    if (fs.existsSync(`./data/${username}/NNData`) === true){
      fs.truncateSync(`./data/${username}/NNData`, 0);
    }
    
    /*Starts appending*/
    fs.appendFile(`./data/${username}/NNData`, `${rows} ${coloumns}\n`, (err) => {
      if (err){
        console.log(err)
      }
    });

    const prom = new Promise(async (resolve, reject) => {

      const readlineInterface = readline.createInterface({
        input: fs.createReadStream(`./data/${username}/drawings`)
      });

      for await (const line of readlineInterface) {
        await fs.promises.appendFile(`./data/${username}/NNData`, line+"\n");
      }

      fs.stat(`./data/${username}/NNData`, (err, stats) => {
        fs.truncate(`./data/${username}/NNData`, stats.size - 1, (err) => {
          resolve();
        });
      });

    });
    await prom.then(() => console.log(`Done writing from [./data/${username}/drawings] to [./data/${username}/NNData]`));
  }
}

function JSONToData(dataObject) {   
  let dataString = "";
  for (let i = 0; i < dataObject.xArray.length; i++) {
    dataString += `${dataObject.xArray[i]} ${dataObject.yArray[i]} ${dataObject.velocities[i]} ${dataObject.gradients[i]}`; /* What actually goes into gradArray? What is the input?*/

    if (i <= dataObject.xArray.length-1) {
      dataString += " "; /*Adds a whitespace between*/
    }
  }

  return dataString;
}



/*The amount of rows/lines in the document is counted and then the number is returned*/
async function CountRows(fileLocation) {
  let linenum = 0; 
  const readlineInterface = readline.createInterface({
    input: fs.createReadStream(fileLocation)
  });

  for await (const line of readlineInterface){
    linenum++;
  }

  readlineInterface.close();

  return linenum;
}