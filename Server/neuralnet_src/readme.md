# NeuralNet N-API

C code originally written by Per Madsen

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