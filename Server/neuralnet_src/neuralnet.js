const neuralnet = require("./build/Release/neuralnetwork");

/*Loads a matrix from a file through C API*/
exports.loadMatrix = function (fileLocation) {
  const obj = neuralnet.loadMatrix(fileLocation);
  return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
};

exports.Matrix = class {
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
      throw `Not adequate amount of values. expected ${this.cols * this.rows}, recieved: ${values.length}`;

    if(rowoffset === undefined) {
      this.rowoffset = calcRowOffset(rows, cols);
    } else {
      this.rowoffset = rowoffset;
    }
    
  }

  /*Gets specific element from values array*/
  getElement(row, col){
    return this.values[this.rows * (col-1) + (row-1)];
  }
}

function calcRowOffset(rows, cols) {
  let rowoffset = [];

  for(let i = 0; i < cols; i++){
      rowoffset.push(i*rows);
  }

  return rowoffset;
}