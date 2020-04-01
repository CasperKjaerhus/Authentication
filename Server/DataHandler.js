const fs = require("fs");
const readline = require("readline");

exports.DataHandler = class {
    constructor (fileLocation, coloumns=1200) {
      
        this.coloumns = coloumns;
        this.rows = 0; /*TODO: function LoadRows() should be created and should read how many current entry rows is in {fileLocation} */
        this.fileLocation = fileLocation;
        
        FileLocCheck(fileLocation, coloumns);
        LoadRows(fileLocation);

    }

    addEntry(entry) {

      /*FIX: space in data gets deleted between row and coloumn number when rows extends to new digit*/

      const writeStream = fs.createWriteStream(this.fileLocation, {start: 0, flags: "r+"});
      this.rows++;
      //When data is appended to the file, the writeStream adds +1 to the row counter, which is on the first line of the file.
      writeStream.write(this.rows.toString(), (err) => {
        if(err) {
          console.log(err);
        }
        /*TODO: Appending of entry into file*/
        writeStream.end(() => {
          fs.appendFileSync(this.fileLocation, `\n${entry}`);
        });
      });
      
    }
}

exports.JSONToData = function(dataJSONString) {

  const dataObject = JSON.parse(dataJSONString);
  let dataString = "";

  for(let i = 0; i < dataObject.xArray.length; i++){
    dataString += ` ${dataObject.xArray[i]} ${dataObject.yArray[i]} ${dataObject.timeStamps[i]} ${dataObject.gradArray[i]}`; /* What actually goes into gradArray? What is the input?*/
  }
  /*
  for(let x of dataObject.xArray){
    datastring += ` ${x}`;
  }
  for(let y of dataObject.yArray){
    datastring += ` ${y}`;
  }
  for(let t of dataObject.timeStamps){
    datastring += ` ${t}`;
  }
  for(let g of dataObject.gradArray){
    datastring += ` ${g}`;
  }
  */
  return dataString;
}

/* Checks if the file exists */
function FileLocCheck(fileLocation, coloumns) {
  if (fs.existsSync(fileLocation)) {
    console.log("FILE LOCATED");
  }
  else {
    /*Creates the file if it does not exist*/
    console.log("FILE NOT LOCATED, CREATING FILE");
    fs.writeFileSync(fileLocation, `0 ${coloumns}`);
  }
}

/*TODO: function LoadRows() should be created and should read how many current entry rows is in {fileLocation} */

/* Mangler at sætte Rows til SlicedInput */
/*TODO: Returnere mængden af rows*/
function LoadRows(fileLocation) {
  let linenum = 0;
  let slicedInput;
  const readlineInterface = readline.createInterface({
    input: fs.createReadStream(fileLocation)
  });

  readlineInterface.on('line', (input) => {
      //https://stackoverflow.com/questions/7988219/how-to-read-only-first-line-of-a-file/7988293#7988293
      
      if (linenum == 0) {
        let FirstSpace = input.indexOf(' ');
        slicedInput = input.slice(0,FirstSpace);
        linenum++;
      }
  });

  readlineInterface.on("end", () => {

    readlineInterface.close();
  });
  

  //SKAL DE SLETTES? +1
  //https://www.youtube.com/watch?v=A79b_4yCudY 
  //https://stackoverflow.com/questions/28747719/what-is-the-most-efficient-way-to-read-only-the-first-line-of-a-file-in-node-js
  //https://nodejs.org/api/readline.html#readline_event_line
}