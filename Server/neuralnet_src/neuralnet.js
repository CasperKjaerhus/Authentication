const neuralnet = require("./build/Release/neuralnetwork");

/*Loads a matrix from a file through C API*/
exports.loadMatrix = function (fileLocation) {
  const obj = neuralnet.loadMatrix(fileLocation);
  return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
};

exports.Matrix = class {

  /*declaring private variables: these can't be seen outside this class*/
  #extMat; // extMat is a matrix containing mean and std. deviation values
  #normalizedMat;

  constructor(rows, cols, values=[], rowoffset){
    this.cols = cols;
    this.rows = rows;
    this.values = values;

    /*if no values are passed to constructor: fill array with 0.0*/
    if(values.length === 0){
      for(let i = 0; i < cols * rows; i++)
        this.values.push(0.0);
    }
    else if(cols * rows != values.length)
      throw `Not correct amount of values. expected ${this.cols * this.rows}, recieved: ${values.length}`;

    if(rowoffset === undefined) {
      this.rowoffset = calcRowOffset(rows, cols);
    } else {
      this.rowoffset = rowoffset;
    }
    
  }
  getExt(){
    if(this.#extMat === undefined){
      this.normalize(); // run normalize in order to get extMat
    }
    return this.#extMat;
  }
  normalize(){
    if(this.#normalizedMat === undefined || this.#extMat === undefined){
      const obj = neuralnet.normalizeMatrix(this);
      this.#normalizedMat = new exports.Matrix(obj[0].rows, obj[0].cols, obj[0].values, obj[0].rowoffset);
      this.#extMat = new exports.Matrix(obj[1].rows, obj[1].cols, obj[1].values, obj[1].rowoffset);
    }
    return this.#normalizedMat;
  }
  print(){
    let str = ""
    for(let i = 0; i < this.rows; i++){
      for(let j = 0; j < this.cols; j++){
        str += `${this.getElement(i+1,j+1).toFixed(2)}\t`;
      }
      str += "\n";
    }
    console.log(str);
  }

  /*Gets specific element from values array*/
  getElement(row, col){
    return this.values[this.rows * (col-1) + (row-1)];
  }

  /*Normalizes matB through matA's mean and std. deviation values*/
  static normalizeThrough(matA, matB){
    const obj = neuralnet.normalizeMatrixWithUext(matB, matA.getExt());
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
  }
}

function calcRowOffset(rows, cols) {
  let rowoffset = [];

  for(let i = 0; i < cols; i++){
      rowoffset.push(i*rows);
  }

  return rowoffset;
}