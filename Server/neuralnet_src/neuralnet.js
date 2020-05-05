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
    let str = "";
    str += `r: ${this.rows} c: ${this.cols}\n`;
    for(let i = 0; i < this.rows; i++) {
      for(let j = 0; j < this.cols; j++) {
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

  /*Normalizes a matrix through this matrix' mean and std. deviation values*/
  normalizeThrough(matB){
    const obj = neuralnet.normalizeMatrixWithUext(this, matB.getExt());
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
  }

  /*Normalizes matB through matA's mean and std. deviation values*/
  static normalizeThrough(matA, matB){
    const obj = neuralnet.normalizeMatrixWithUext(matB, matA.getExt());
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
  }
}

exports.MLP_Net = class { 
  /*Constructs a mlp_net through gaussinit*/
  constructor(numNodesIn, numNodesHiddenLayer, numNodesOut, alphaVal=0.0, sigmaSpread=0.4){
    this.numNodesIn = numNodesIn;
    this.numNodesHiddenLayer = numNodesHiddenLayer;
    this.numNodesOut = numNodesOut;

    /*gaussinitation of mlp_net*/
    const obj = neuralnet.gaussinit(numNodesIn, numNodesHiddenLayer, numNodesOut, alphaVal, sigmaSpread);

    /*Transfering values*/
    this.inw = new exports.Matrix(obj.inw.rows, obj.inw.cols, obj.inw.values, obj.inw.rowoffset);
    this.udw = new exports.Matrix(obj.udw.rows, obj.udw.cols, obj.udw.values, obj.udw.rowoffset);
    this.inoff = new exports.Matrix(obj.inoff.rows, obj.inoff.cols, obj.inoff.values, obj.inoff.rowoffset);
    this.udoff = new exports.Matrix(obj.udoff.rows, obj.udoff.cols, obj.udoff.values, obj.udoff.rowoffset);
    this.udwt = new exports.Matrix(obj.udwt.rows, obj.udwt.cols, obj.udwt.values, obj.udwt.rowoffset);
    this.indwt = new exports.Matrix(obj.indwt.rows, obj.indwt.cols, obj.indwt.values, obj.indwt.rowoffset);
    this.inwmel = new exports.Matrix(obj.inwmel.rows, obj.inwmel.cols, obj.inwmel.values, obj.inwmel.rowoffset);
    this.udwmel = new exports.Matrix(obj.udwmel.rows, obj.udwmel.cols, obj.udwmel.values, obj.udwmel.rowoffset);
    this.fejl1 = new exports.Matrix(obj.fejl1.rows, obj.fejl1.cols, obj.fejl1.values, obj.fejl1.rowoffset);
    this.fejl2 = new exports.Matrix(obj.fejl2.rows, obj.fejl2.cols, obj.fejl2.values, obj.fejl2.rowoffset);
    this.melres1 = new exports.Matrix(obj.melres1.rows, obj.melres1.cols, obj.melres1.values, obj.melres1.rowoffset);
    this.melres2 = new exports.Matrix(obj.melres2.rows, obj.melres2.cols, obj.melres2.values, obj.melres2.rowoffset);
    this.melres3 = new exports.Matrix(obj.melres3.rows, obj.melres3.cols, obj.melres3.values, obj.melres3.rowoffset);
    this.out0 = new exports.Matrix(obj.out0.rows, obj.out0.cols, obj.out0.values, obj.out0.rowoffset);
    this.out1 = new exports.Matrix(obj.out1.rows, obj.out1.cols, obj.out1.values, obj.out1.rowoffset);
  }
}

function calcRowOffset(rows, cols) {
  let rowoffset = [];

  for(let i = 0; i < cols; i++){
      rowoffset.push(i*rows);
  }

  return rowoffset;
}