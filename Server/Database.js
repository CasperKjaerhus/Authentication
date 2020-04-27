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

  static deleteUser(username){
    fs.readdir(`./data/${username}`, (err, files) => {
      let promises = new Array();
      for(let file of files) {
        promises.push(new Promise((resolve, reject) => {
          fs.unlink(`./data/${username}/${file}`, (err) => {
            if(err){
              console.log(err);
              reject();
            }
            console.log(`Deleted: ./data/${username}/${file}`);
            resolve();
          });
        }));
      }
      Promise.all(promises).then(() => {
        fs.rmdir(`./data/${username}`, (err) => {
          if(err){
            console.log(err);
          }
        })
      })
    });
  }
}


function CreateUserPath(username){
  try {
    fs.mkdirSync(`./data/${username}`);
    fs.writeFileSync(`./data/${username}/drawing`, "");
    fs.writeFileSync(`./data/${username}/NNData`, "");
  } catch(e){
    console.log(e);
  }
}
