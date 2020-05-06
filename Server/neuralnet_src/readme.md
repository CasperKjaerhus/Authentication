# NeuralNet N-API

C code originally written by Per Madsen

# Building
In order to build this N-API module, a C/C++ toolchain should be installed.

## C/C++ toolchain
For Windows (run in cmd with admin rights):

    npm install --global --production windows-build-tools
For Mac:

    xcode-select --install
For Linux developers, the necessary C/C++ toolchain packages are readily available. GCC is widely used in the Node.js community to build and test across a variety of plarforms. For many developers, the LLVM compiler infrastructure is also a good choice.

## npm install
Once everything is installed, run

    npm install
in the neuralnet_src directory, and everything should compile successfully!

# Documentation

## Classes

### Matrix
A matrix holds an array of values arranged in rows and coloumns

#### Constructor: 
* rows **\<Number\>**
* coloumns **\<Number\>**
* values **\<Number[ ]\>**
    - optional: gets filled with zeroes if left out
* rowoffset **\<Number [ ]\>** -
    - optional: gets calculated if leftut
* Returns **\<Matrix\>**

#### Matrix.getElement(rows, cols)
Gets value at specified row and coloumn
* rows **\<Number\>**
* coloumns **\<Number\>**
* Returns: **\<Number\>**

#### Matrix.getExt()
Gets the mean values and standard deviation (used for normalization) and returns a Matrix containing those

* Returns **\<Matrix\>** 

#### Matrix.normalize()
Normalizes and returns a new normalized instance of this matrix.

* Return **\<Matrix\>**

#### Matrix.print()
Prints a matrix row by row into stdout. returns the printed Matrix

* Returns **\<Matrix\>**

#### getElement(row, col)
Gets value located at row, col. Starts at 1, 1.

* row: **\<Number\>**
* col: **\<Number\>**
* Returns: **\<Number\>**

#### setElement(row, col, val)
Sets the value located at row, col. Starts at 1, 1.

* row: **\<Number\>**
* col: **\<Number\>**
* val: **\<Number\>**

#### normalizeThrough(matB)
Normalizes this matrix with another matrix' mean values and standard deviation matrix. Its important that the matrix getting normalized has the same coloumns as matB.

* matB **\<Matrix\>**
* Returns: **\<Matrix\>** 

#### getRow(index)
Returns a row from this matrix at index
* index **\<Number\>**
* Returns: **\<Matrix\>**

#### transpose()
Transposes matrix
* Returns: **\<Matrix\>**

#### static compare(matA, matB, range)
compares two matrixes and returns whether their values are within a certain range of another. 
* matA: **\<Matrix\>**
* matB: **\<Matrix\>**
* range: **\<Number\>**
* returns: **\<Boolean\>**

### MLPNet
A neural net

#### constructor:

* numNodesIn: **\<Number\>**
* numNodesHiddenLayer: **\<Number\>**
* numNodesOut: **\<Number\>**
* Returns: **\<MLPNet\>**

#### MLPNet.gaussinit(alphaVal, sigmaSpread)
Gauss initialized the MLPNet, through an alpha value and spread value. Spread is how far apart the random initalized number should be from eachother.

* alphaVal: **\<Number\>**
* sigmaSpread: **\<Number\>**
* Returns: **\<MLPNet\>**

#### MLPNet.train(numEpochs, trainMatrixInput, trainMatrixOutput, alphaVal)
Trains the MLPNet on input and wanted output. Its important that the input rows corrosponds with the desired output rows.

* numEpochs: **\<Number\>** *- number of epochs the neural network should train on this data*
* trainMatrixInput: **\<Matrix\>** *- matrix of input that the neural network trains upon*
* trainMatrixOutput: **\<Matrix\>** *- matrix of desired outputs corrosponding with trainMatrixInput*
* alphaVal: **\<Number\>** *- amount the neural network should go towards gradient descent*

#### MLPNet.decide(matrixInput)
makes the MLPNet decide on a given input

* MatrixInput: **\<Matrix>** - *1 row matrix as input data*
* Returns: **\<Matrix\>** - *Output from Neural Net*

#### MLPNet.saveToFile(fileLocation)
Saves a MLPNet to given file location

* fileLocation: **\<String\>**

## Functions

### NeuralNet.loadMatrix(fileLocation)
Loads a matrix from a matrix file
* fileLocation **\<String\>**
* Returns: **\<Matrix\>**