const fs = require("fs");

exports.DataHandler = class {
    constructor (fileLocation, coloumns=1200) {

        FileLocCheck(fileLocation);

        this.fileLocation = fileLocation;
        this.coloumns = coloumns;
        this.rows = 0; /*TODO: function LoadRows() should be created and should read how many current entry rows is in {fileLocation} */
    }

    addEntry(entry) {
      const writeStream = fs.createWriteStream(this.fileLocation, {start: 0, flags: "r+"});
      this.rows++;
      writeStream.write(this.rows, (err) => {
        if(err){
          console.log(err);
        }
        writeStream.end();
      });
      
      /*TODO: Appending of entry into file*/
    }

}

/* Checks if the file exists */
function FileLocCheck(fileLocation) {
  if (fs.existsSync(fileLocation)) {
    console.log("FILE LOCATED");
  }
  else {
    /*Creates the file if it does not exist*/
    console.log("FILE NOT LOCATED, CREATING FILE");
    fs.writeFileSync(fileLocation, "");
  }
}
