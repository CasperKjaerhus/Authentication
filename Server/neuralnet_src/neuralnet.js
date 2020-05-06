const neuralnet = require("./build/Release/neuralnetwork");

/*Loads a matrix from a file through C API*/
exports.loadMatrix = function (fileLocation) {
  const obj = neuralnet.loadMatrix(fileLocation);
  return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
};

exports.loadMLPNet = function (fileLocation) {
  const obj = neuralnet.loadMLP(fileLocation);

  NN = new exports.MLP_Net(obj.inw.cols, obj.inw.rows, obj.udw.rows);

  NN.inw = new exports.Matrix(obj.inw.rows, obj.inw.cols, obj.inw.values, obj.inw.rowoffset);
  NN.udw = new exports.Matrix(obj.udw.rows, obj.udw.cols, obj.udw.values, obj.udw.rowoffset);
  NN.inoff = new exports.Matrix(obj.inoff.rows, obj.inoff.cols, obj.inoff.values, obj.inoff.rowoffset);
  NN.udoff = new exports.Matrix(obj.udoff.rows, obj.udoff.cols, obj.udoff.values, obj.udoff.rowoffset);
  NN.udwt = new exports.Matrix(obj.udwt.rows, obj.udwt.cols, obj.udwt.values, obj.udwt.rowoffset);
  NN.indwt = new exports.Matrix(obj.indwt.rows, obj.indwt.cols, obj.indwt.values, obj.indwt.rowoffset);
  NN.inwmel = new exports.Matrix(obj.inwmel.rows, obj.inwmel.cols, obj.inwmel.values, obj.inwmel.rowoffset);
  NN.udwmel = new exports.Matrix(obj.udwmel.rows, obj.udwmel.cols, obj.udwmel.values, obj.udwmel.rowoffset);
  NN.fejl1 = new exports.Matrix(obj.fejl1.rows, obj.fejl1.cols, obj.fejl1.values, obj.fejl1.rowoffset);
  NN.fejl2 = new exports.Matrix(obj.fejl2.rows, obj.fejl2.cols, obj.fejl2.values, obj.fejl2.rowoffset);
  NN.melres1 = new exports.Matrix(obj.melres1.rows, obj.melres1.cols, obj.melres1.values, obj.melres1.rowoffset);
  NN.melres2 = new exports.Matrix(obj.melres2.rows, obj.melres2.cols, obj.melres2.values, obj.melres2.rowoffset);
  NN.melres3 = new exports.Matrix(obj.melres3.rows, obj.melres3.cols, obj.melres3.values, obj.melres3.rowoffset);
  NN.out0 = new exports.Matrix(obj.out0.rows, obj.out0.cols, obj.out0.values, obj.out0.rowoffset);
  NN.out1 = new exports.Matrix(obj.out1.rows, obj.out1.cols, obj.out1.values, obj.out1.rowoffset);  

  return NN;
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
      //this.normalize(); // run normalize in order to get extMat
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

  setElement(row, col, val){
    this.values[this.rows * (col-1) + (row-1)] = val;
  }

  /*Normalizes a matrix through this matrix' mean and std. deviation values*/
  normalizeThrough(matB){
    const obj = neuralnet.normalizeMatrixWithUext(this, matB.getExt());
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
  }

  getRow(index){
    let values = [];
    for(let i = 0; i < this.cols; i++) {
      values.push(this.getElement(index, i+1));
    }
    return new exports.Matrix(1, this.cols, values);
  }
  transpose(){
    const obj = new exports.Matrix(this.cols, this.rows);

    for(let i = 1; i <= this.rows; i++){
      for(let j = 1; j <= this.cols; j++){
        obj.setElement(j,i, this.getElement(i,j));
      }
    }

    return obj;
  }

  /*Normalizes matB through matA's mean and std. deviation values*/
  static normalizeThrough(matA, matB){
    const obj = neuralnet.normalizeMatrixWithUext(matB, matA.getExt());
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset);
  }
  static compare(matA, matB, range){
    for(let i = 0; i < matA.rows; i++){
      for(let j = 0; j < matA.cols; j++){
        if((matA.getElement(i,j) - matB.getElement(i,j)) > range){
          return false;
        }
      } 
    }
    return true;
  }
}

exports.MLP_Net = class { 
  /*Constructs a mlp_net through gaussinit*/
  constructor(numNodesIn, numNodesHiddenLayer, numNodesOut){
    this.numNodesIn = numNodesIn;
    this.numNodesHiddenLayer = numNodesHiddenLayer;
    this.numNodesOut = numNodesOut;

    /*Declaring matrixs*/
    this.inw;
    this.udw;
    this.inoff;
    this.udoff;
    this.udwt;
    this.indwt;
    this.inwmel;
    this.udwmel;
    this.fejl1;
    this.fejl2;
    this.melres1;
    this.melres2;
    this.melres3;
    this.out0;
    this.out1;    
  }
  gaussinit(alphaVal=0.0, sigmaSpread=0.4){
    /*gaussinitation of mlp_net*/
    const obj = neuralnet.gaussinit(this.numNodesIn, this.numNodesHiddenLayer, this.numNodesOut, alphaVal, sigmaSpread);

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
    
    return this;
  }
  saveToFile(fileLocation){
    neuralnet.saveMLP(fileLocation, this);
  }

  train(numEpochs, trainMatrixInput, trainMatrixOutput, alphaVal){
    const obj = neuralnet.trainMLPNet(this, numEpochs, trainMatrixInput, trainMatrixOutput, alphaVal);

    this.inw = obj.inw;
    this.udw = obj.udw;
    this.inoff = obj.inoff;
    this.udoff = obj.udoff;
    this.udwt = obj.udwt;
    this.indwt = obj.indwt;
    this.inwmel = obj.inwmel;
    this.udwmel = obj.udwmel;
    this.fejl1 = obj.fejl1;
    this.fejl2 = obj.fejl2;
    this.melres1 = obj.melres1;
    this.melres2 = obj.melres2;
    this.melres3 = obj.melres3;
    this.out0 = obj.out0;
    this.out1 = obj.out1;
    
    return this;
  }

  decide(matrixInput){
    const obj = neuralnet.decideMLPNet(this, matrixInput.transpose(), this.numNodesOut);
    return new exports.Matrix(obj.rows, obj.cols, obj.values, obj.rowoffset).transpose();
  }
}

function calcRowOffset(rows, cols) {
  let rowoffset = [];

  for(let i = 0; i < cols; i++){
      rowoffset.push(i*rows);
  }

  return rowoffset;
}