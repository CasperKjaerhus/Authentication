const neuralnet = require("./build/Release/neuralnetwork");

/*Loads a matrix from a file through C API*/
exports.loadMatrix = function (fileLocation) {
  const obj = neuralnet.loadMatrix(fileLocation);
  return new exports.Matrix(obj.cols, obj.rows, obj.values, obj.rowoffset);
};

exports.Matrix = class {
  constructor(cols, rows, values=[], rowoffset){
    this.cols = cols;
    this.rows = rows;
    this.values = values;

    if(rowoffset === undefined) {
      this.rowoffset = calcRowOffset(cols, rows);
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