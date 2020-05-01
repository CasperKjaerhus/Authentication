const neuralnet = require("./NN_C_src/build/Release/neuralnetwork");

const Matrix = class {
    constructor(cols, rows, values=[], rowoffset=[]){
        this.cols = cols;
        this.rows = rows;
        this.values = values;
        this.rowoffset = rowoffset;
    }

    /*Gets specific element from values array*/
    getElement(row, col){
        return this.values[this.rows * (col-1) + (row-1)];
    }

    /*Loads a matrix from a file through C API*/
    static loadMatrix(fileLocation){
        const obj = neuralnet.loadMatrix(fileLocation);
        return new this(obj.cols, obj.rows, obj.values, obj.rowoffset);
    }
}

const mat = Matrix.loadMatrix("./data/Test/inLearning.txt");
