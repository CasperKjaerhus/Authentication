const fs = require("fs");

exports.DataHandler = class {
    constructor (fileLocation, coloumns=400) {

        FileLocCheck(fileLocation);

        this.fileLocation = fileLocation;
        this.coloumns = coloumns;
        this.rows = 0;
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