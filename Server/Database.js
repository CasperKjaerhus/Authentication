const fs = require("fs");

exports.Database = class {
  constructor(){}

  static createUser(username){
    if(!this.DoesUserExist(username)) {
      CreateUserPath(username);
      return true;
    } else {
      return false;
    };
  }

  static DoesUserExist(username){  
    if(fs.existsSync(`./data/${username}`) === false) {
      return false;
    } else {
      return true;
    }
  }
}


function CreateUserPath(username){
  try {
    fs.mkdirSync(`./data/${username}`);
    fs.writeFileSync(`./data/${username}/drawings`, "");
    fs.writeFileSync(`./data/${username}/NNData`, "");
  } catch(e){
    console.log(e);
  }
}
