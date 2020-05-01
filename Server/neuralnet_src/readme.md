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

* rows **\<Number\>**
* coloumns **\<Number\>**
* values **\<Number[ ]\>**
* rowoffset **\<Number [ ]\>** - optional

#### Matrix.getElement(rows, cols)
Gets value at specified row and coloumn
* rows **\<Number\>**
* coloumns **\<Number\>**
* Returns: **\<Number\>**

## Functions

### NeuralNet.loadMatrix(fileLocation)
Loads a matrix from a matrix file
* fileLocation **\<String\>**
* Returns: **\<Matrix\>**