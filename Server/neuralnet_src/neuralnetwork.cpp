#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <time.h>
#include "matlib.h"
#include "neu.h"

namespace neuralnetwork {

/*Function headers*/

napi_status makeMatrixNodeObj(napi_env env, matrix* mat, napi_value* matrixObj);
napi_status makeMlpnetNodeObj(napi_env env, mlp_net nn_net, napi_value* mlpnetVal);
napi_status getProperty(napi_env env, napi_value obj, char *key, napi_value *value);
napi_status getString(napi_env env, napi_value stringObj, char **string);

matrix* makeCMatrix(napi_env env, napi_value mat);
mlp_net* makeCMlp_net(napi_env env, napi_value nn_netVal);

napi_value loadMatrix(napi_env env, napi_callback_info cbinfo);
napi_value normalizeMatrix(napi_env env, napi_callback_info cbinfo);
napi_value normalizeMatrixWithExt(napi_env env, napi_callback_info cbinfo);
napi_value gaussinit(napi_env env, napi_callback_info cbinfo);
napi_value loadMLPNet(napi_env env, napi_callback_info cbinfo);
napi_value saveMLPNet(napi_env env, napi_callback_info cbinfo);
napi_value trainMLPNet(napi_env env, napi_callback_info cbinfo);
napi_value decideMLPNet(napi_env env, napi_callback_info cbinfo);

void* MLPTrainExecute(napi_env env, void *data);

void* MLPTrainComplete(napi_env env, napi_status status, void* data);

/*Function definitions*/
napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value loadMatrixFn, normalizeMatrixfn, normalizeMatrixWithExtfn, 
             gaussinitfn, mlploadfn, mlpsavefn, trainMLPNetfn, decideMLPNetfn;

  status = napi_create_function(env, NULL, 0, loadMatrix, NULL, &loadMatrixFn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "loadMatrix", loadMatrixFn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, normalizeMatrix, NULL, &normalizeMatrixfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "normalizeMatrix", normalizeMatrixfn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, normalizeMatrixWithExt, NULL, &normalizeMatrixWithExtfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "normalizeMatrixWithUext", normalizeMatrixWithExtfn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, gaussinit, NULL, &gaussinitfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "gaussinit", gaussinitfn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, loadMLPNet, NULL, &mlploadfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "loadMLP", mlploadfn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, saveMLPNet, NULL, &mlpsavefn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "saveMLP", mlpsavefn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, trainMLPNet, NULL, &trainMLPNetfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "trainMLPNet", trainMLPNetfn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, decideMLPNet, NULL, &decideMLPNetfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "decideMLPNet", decideMLPNetfn);
  if (status != napi_ok) return NULL;

  return exports;
}

/*exported functions below here*/
napi_value loadMatrix(napi_env env, napi_callback_info cbinfo) {

  char* fileLocation;
  size_t length;

  matrix* mat;

  napi_value parameter, matrixObj;
  size_t parametersAmount = 1;

  /*Getting the parameters sent from JavaScript call, into parameters array*/
  napi_status status = napi_get_cb_info(env, cbinfo, &parametersAmount, &parameter, NULL, NULL);
  if(status != napi_ok) return NULL;

  /*Puts parameter string into fileLocation*/
  status = getString(env, parameter, &fileLocation);
  if(status != napi_ok) return NULL;

  /*Loading and creation of matrix object*/
  loadMattxt(fileLocation,  &mat);
  makeMatrixNodeObj(env, mat, &matrixObj);

  /*Frees allocated memory space*/
  killmat(&mat);
  free(fileLocation);

  return matrixObj;
}

napi_value normalizeMatrix(napi_env env, napi_callback_info cbinfo){
  napi_value matrixObj, values, matrixNormalizedObj, matrixExtObj, returnArray;
  size_t parametersAmount = 1;
  matrix *matOriginal, *matExt, *matNormalized;

  napi_status status = napi_get_cb_info(env, cbinfo, &parametersAmount, &matrixObj, NULL, NULL);
  if(status != napi_ok) return NULL;

  matOriginal = makeCMatrix(env, matrixObj);

  initmat(&matExt, matOriginal->cols, 2, 0.0);
  initmat(&matNormalized, matOriginal->rows, matOriginal->cols, 0.0);

  matnormp(matOriginal, &matNormalized, &matExt, 1);
  
  makeMatrixNodeObj(env, matNormalized, &matrixNormalizedObj);
  makeMatrixNodeObj(env, matExt, &matrixExtObj);

  status = napi_create_array_with_length(env, 2, &returnArray);
  if(status != napi_ok) return NULL;

  status = napi_set_element(env, returnArray, 0, matrixNormalizedObj);
  if(status != napi_ok) return NULL;

  status = napi_set_element(env, returnArray, 1, matrixExtObj);
  if(status != napi_ok) return NULL;

  killmat(&matExt);
  killmat(&matNormalized);
  killmat(&matOriginal);

  return returnArray;
}

napi_value normalizeMatrixWithExt(napi_env env, napi_callback_info cbinfo){

  napi_status status;
  napi_value matrixParam, extParam, returnVal;

  napi_value params[2];
  size_t paramNum = 2;

  matrix *matrixOriginal, *uext, *normMatrix;

  status = napi_get_cb_info(env, cbinfo, &paramNum, params, NULL, NULL);
  if(status != napi_ok) return NULL;

  matrixOriginal = makeCMatrix(env, params[0]);
  uext = makeCMatrix(env, params[1]);

  initmat(&normMatrix, matrixOriginal->rows, matrixOriginal->cols, 0.0);
  matnormpext(matrixOriginal, &normMatrix, uext, 1);

  status = makeMatrixNodeObj(env, normMatrix, &returnVal);
  if(status != napi_ok) return NULL;

  killmat(&matrixOriginal);
  killmat(&uext);
  killmat(&normMatrix);
  return returnVal;
}

napi_value gaussinit(napi_env env, napi_callback_info cbinfo){
  napi_status status;

  napi_value parameters[5];
  size_t parametersAmount = 5;

  mlp_net *nn;

  napi_value numInVal, numHiddenVal, numOutVal, mlp_netVal;
  int numIn, numHidden, numOut;
  double alpha, spread;

  status = napi_get_cb_info(env, cbinfo, &parametersAmount, parameters, NULL, NULL);
  if(status != napi_ok) return NULL;

  status = napi_get_value_int32(env, parameters[0], &numIn);
  if(status != napi_ok) return NULL;
  status = napi_get_value_int32(env, parameters[1], &numHidden);
  if(status != napi_ok) return NULL;
  status = napi_get_value_int32(env, parameters[2], &numOut);
  if(status != napi_ok) return NULL;
  status = napi_get_value_double(env, parameters[3], &alpha);
  if(status != napi_ok) return NULL;
  status = napi_get_value_double(env, parameters[4], &spread);
  if(status != napi_ok) return NULL;

  mlp_gaussinit(&nn, numIn, numHidden, numOut, alpha, spread);

  status = makeMlpnetNodeObj(env, *nn, &mlp_netVal);
  if(status != napi_ok) return NULL;

  kill_bpenet(&nn);

  return mlp_netVal;
}

napi_value loadMLPNet(napi_env env, napi_callback_info cbinfo){
  char* fileLocation;
  mlp_net *neuralNet;
  int nnIn, nnHidden, nnOut;

  napi_value parameter, mlpnn;
  size_t parametersAmount = 1;

  napi_status status = napi_get_cb_info(env, cbinfo, &parametersAmount, &parameter, NULL, NULL);
  if(status != napi_ok) return NULL; 

  status = getString(env, parameter, &fileLocation);
  if(status != napi_ok) return NULL;

  load_bpenetTxt(fileLocation, &neuralNet, &nnIn, &nnHidden, &nnOut);
  status = makeMlpnetNodeObj(env, *neuralNet, &mlpnn);
  if(status != napi_ok) return NULL;
  
  kill_bpenet(&neuralNet);
  free(fileLocation);
  
  return mlpnn;
}

napi_value saveMLPNet(napi_env env, napi_callback_info cbinfo){
  napi_value parameters[2], returnBool;
  size_t paramNum = 2;
  char* fileLocation;
  mlp_net *neuralNet;
  napi_status status = napi_create_int32(env, 0, &returnBool);
  if(status != napi_ok) return returnBool;

  status = napi_get_cb_info(env, cbinfo, &paramNum, parameters, NULL, NULL);
  if(status != napi_ok) return returnBool;

  status = getString(env, parameters[0], &fileLocation);
  if(status != napi_ok) return returnBool;

  neuralNet = makeCMlp_net(env, parameters[1]);

  save_bpenetTxt(fileLocation, neuralNet);

  status = napi_create_int32(env, 1, &returnBool);
  if(status != napi_ok) return returnBool;

  kill_bpenet(&neuralNet);
  free(fileLocation);

  return returnBool;
}

napi_value trainMLPNet(napi_env env, napi_callback_info cbinfo){
  napi_value parameters[5], napiNeuralNetObj, promise, promiseName;
  size_t paramNum = 5;
  mlp_net **neuralNet;

  matrix **trainIn, **trainOut, **tempMat;

  int numEpochs;

  double alphaVal;

  neuralNet = (mlp_net **) malloc(sizeof(mlp_net **));
  trainIn = (matrix **) calloc(sizeof(matrix **), 1);
  trainOut = (matrix **) calloc(sizeof(matrix **), 1);
  tempMat = (matrix **) calloc(sizeof(matrix **), 1);

  napi_status status = napi_get_cb_info(env, cbinfo, &paramNum, parameters, NULL, NULL);
  if (status != napi_ok) return NULL;

  *neuralNet = makeCMlp_net(env, parameters[0]);

  status = napi_get_value_int32(env, parameters[1], &numEpochs);
  if (status != napi_ok) return NULL;
  status = napi_get_value_double(env, parameters[4], &alphaVal);
  if (status != napi_ok) return NULL;

  *trainIn = makeCMatrix(env, parameters[2]);
  *trainOut = makeCMatrix(env, parameters[3]);
  initmat(tempMat, (*trainIn)->rows, max((*trainIn)->cols, (*trainOut)->cols), 0.0);

  /*Async time*/
  struct MLPTrainExecuteData{
    matrix **tempMat, **trainIn, **trainOut;
    mlp_net **neuralNet;
    int numEpochs;
    double alphaVal;
    napi_deferred promise;
  } *dataVar;

  dataVar = (MLPTrainExecuteData *) calloc(sizeof(MLPTrainExecuteData), 1);
  dataVar->alphaVal = alphaVal;
  dataVar->tempMat = tempMat;
  dataVar->trainIn = trainIn;
  dataVar->trainOut = trainOut;
  dataVar->neuralNet = neuralNet;
  dataVar->numEpochs = numEpochs;

  napi_create_string_utf8(env, "TrainWork", 10, &promiseName);
  status = napi_create_promise(env, &(dataVar->promise), &promise);

  napi_async_work trainWork;

  status = napi_create_async_work(env, NULL, promiseName, (napi_async_execute_callback) MLPTrainExecute, (napi_async_complete_callback) MLPTrainComplete, dataVar, &trainWork);
  if(status != napi_ok) return NULL;

  status = napi_queue_async_work(env, trainWork);
  if(status != napi_ok) return NULL;

  return promise;
}
#pragma region fold
napi_value decideMLPNet(napi_env env, napi_callback_info cbinfo){
  napi_value output, parameters[3];
  size_t parameterNum = 3;

  mlp_net *neuralNet;
  matrix *nninput, *nnoutput;
  int outNodes;

  napi_status status = napi_get_cb_info(env, cbinfo, &parameterNum, parameters, NULL, NULL);
  if(status != napi_ok) return NULL;

  status = napi_get_value_int32(env, parameters[2], &outNodes);
  neuralNet = makeCMlp_net(env, parameters[0]);
  nninput = makeCMatrix(env, parameters[1]);
  initmat(&nnoutput, outNodes, 1, 0.0);

  bpe_forward(nninput, neuralNet, &nnoutput);

  status = makeMatrixNodeObj(env, nnoutput, &output);
  if(status != napi_ok) return NULL;

  kill_bpenet(&neuralNet);
  killmat(&nninput);
  killmat(&nnoutput);

  return output;
}
/*Non-exported functions below here*/

/****************************************************************************/
/*Makes a JavaScript object from a matrix                                   */
/* {IN} env         - N-API environment context                             */
/* {IN} mat         - Matrix struct                                         */
/* {OUT} matrixObj  - N-API value pointer pointing to the JavaScript object */
/****************************************************************************/
napi_status makeMatrixNodeObj(napi_env env, matrix* mat, napi_value* matrixObj){
  napi_status status;
  napi_value rows, cols, valArray, rowoffsetArray;
  /*Creating a JavaScript Object that should hold our matrix*/
  status = napi_create_object(env, matrixObj);
  if(status != napi_ok) return status;

  /*Rows and coloumn properties*/
  status = napi_create_int32(env, mat->rows, &rows);
  if(status != napi_ok) return status;

  status = napi_create_int32(env, mat->cols, &cols);
  if(status != napi_ok) return status;

  status = napi_set_named_property(env, *matrixObj, "rows", rows);
  if(status != napi_ok) return status;

  status = napi_set_named_property(env, *matrixObj, "cols", cols);
  if(status != napi_ok) return status;

  /*Creates JavaScript array*/
  status = napi_create_array_with_length(env, mat->cols * mat->rows, &valArray);
  if(status != napi_ok) return status;

  /*Fills the array with matrix values*/
  for(int i = 0; i < mat->cols * mat->rows; i++){
    napi_value element;
    status = napi_create_double(env, (double) mat->vaerdi[i], &element);
    if(status != napi_ok) return status;

    status = napi_set_element(env, valArray, i, element);
    if(status != napi_ok) return status;
  }

  status = napi_set_named_property(env, *matrixObj, "values", valArray);
  if(status != napi_ok) return status;

  status = napi_create_array_with_length(env, mat->cols, &rowoffsetArray);
  if(status != napi_ok) return status;

  /*Fills the array with matrix rowoffset*/
  for(int i = 0; i < mat->cols; i++){

    napi_value element;
    status = napi_create_int32(env, mat->rowoffset[i], &element);
    if(status != napi_ok) return status;

    status = napi_set_element(env, rowoffsetArray, i, element);
    if(status != napi_ok) return status;
  }

  status = napi_set_named_property(env, *matrixObj, "rowoffset", rowoffsetArray);
  if(status != napi_ok) return status;

  return napi_ok;
}

/****************************************************************************/
/*Makes a C from a JavaScript matrix                                        */
/* {IN} env         - N-API environment context                             */
/* {IN} mat         - N-API_Value containing the matrix object from JS      */
/* returns Matrix*  - pointer to matrix struct made                         */
/****************************************************************************/
matrix* makeCMatrix(napi_env env, napi_value mat){
  napi_value rows, cols, values;
  napi_status status;

  int valRows, valCols;
  float *valValues;

  matrix *matC;

  status = getProperty(env, mat, "rows", &rows);
  if(status != napi_ok) return NULL;
  status = getProperty(env, mat, "cols", &cols);
  if(status != napi_ok) return NULL;
  status = getProperty(env, mat, "values", &values);
  if(status != napi_ok) return NULL;

  /*Turns rows and cols into C variables*/
  status = napi_get_value_int32(env, rows, &valRows);
  if(status != napi_ok) return NULL;
  status = napi_get_value_int32(env, cols, &valCols);
  if(status != napi_ok) return NULL;

  initmat(&matC, valRows, valCols, 0);

  for(int i = 0; i < valRows * valCols; i++){
    napi_value element;
    double elementC;

    status = napi_get_element(env, values, i, &element);
    if(status != napi_ok) return NULL;

    status = napi_get_value_double(env, element, &elementC);
    if(status != napi_ok) return NULL;
    matC->vaerdi[i] = (float) elementC;
  }
  return matC;
}

/****************************************************************************/
/*Makes a JavaScript object from a matrix                                   */
/* {IN} env             - N-API environment context                         */
/* {IN} nn_net          - mlp_net struct containing the neural network      */
/* {OUT}                - pointer napi_value where the object should go     */
/****************************************************************************/
napi_status makeMlpnetNodeObj(napi_env env, mlp_net nn_net, napi_value* mlpnetVal){
  napi_status status;
  napi_value inw, udw, inoff, udoff, udwt, indwt, inwmel, udwmel;
  napi_value fejl1, fejl2, melres1, melres2, melres3;
  napi_value out0, out1;
  napi_value numNodesIn, numNodesHiddenLayer, numNodesOut;

  /*Creating the actual mlp_net object in node*/
  status = napi_create_object(env, mlpnetVal);
  if(status != napi_ok) return status;

  /*Creating matrix node objects*/
  status = makeMatrixNodeObj(env, nn_net.fejl1, &fejl1);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.fejl2, &fejl2);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.indwt, &indwt);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.inoff, &inoff);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.inw, &inw);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.inwmel, &inwmel);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.melres1, &melres1);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.melres2, &melres2);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.melres3, &melres3);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.out0, &out0);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.out1, &out1);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.udoff, &udoff);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.udw, &udw);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.udwmel, &udwmel);
  if(status != napi_ok) return status;
  status = makeMatrixNodeObj(env, nn_net.udwt, &udwt);
  if(status != napi_ok) return status;

  /*Setting properties*/
  status = napi_set_named_property(env, *mlpnetVal, "fejl1", fejl1);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "fejl2", fejl2);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "indwt", indwt);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "inoff", inoff);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "inw", inw);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "inwmel", inwmel);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "melres1", melres1);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "melres2", melres2);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "melres3", melres3);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "out0", out0);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "out1", out1);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "udoff", udoff);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "udw", udw);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "udwmel", udwmel);
  if(status != napi_ok) return status;
  status = napi_set_named_property(env, *mlpnetVal, "udwt", udwt);
  if(status != napi_ok) return status;

  return napi_ok;
}

/****************************************************************************/
/*Makes a mlp_net struct from a nodejs object                               */
/* {IN} env         - N-API environment context                             */
/* {IN} nn_net      - mlp_net struct containing the neural network          */
/* returns Matrix*  - pointer to matrix struct made                         */
/****************************************************************************/
mlp_net* makeCMlp_net(napi_env env, napi_value nn_netVal){
  napi_status status;
  napi_value inw, udw, inoff, udoff, udwt, indwt, inwmel, udwmel;
  napi_value fejl1, fejl2, melres1, melres2, melres3;
  napi_value out0, out1;
  napi_value numNodesIn, numNodesHiddenLayer, numNodesOut;

  mlp_net *nn_net = (mlp_net *) calloc(sizeof(mlp_net), 1);

  /*Long chain of getting properties out of NodeJS Objects :(*/

  status = getProperty(env, nn_netVal, "inw", &inw);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udw", &udw);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "fejl1", &fejl1);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "fejl2", &fejl2);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "indwt", &indwt);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "inoff", &inoff);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "inwmel", &inwmel);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres1", &melres1);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres2", &melres2);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres3", &melres3);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "out0", &out0);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "out1", &out1);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udoff", &udoff);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udwmel", &udwmel);
  if(status != napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udwt", &udwt);
  if(status != napi_ok) return NULL;

  /*Transfering values into struct*/
  nn_net->fejl1 = makeCMatrix(env, fejl1);
  nn_net->fejl2 = makeCMatrix(env, fejl2);
  nn_net->indwt = makeCMatrix(env, indwt);
  nn_net->inoff = makeCMatrix(env, inoff);
  nn_net->inw = makeCMatrix(env, inw);
  nn_net->inwmel = makeCMatrix(env, inwmel);
  nn_net->melres1 = makeCMatrix(env, melres1);
  nn_net->melres2 = makeCMatrix(env, melres2);
  nn_net->melres3 = makeCMatrix(env, melres3);
  nn_net->out0 = makeCMatrix(env, out0);
  nn_net->out1 = makeCMatrix(env, out1);
  nn_net->udoff = makeCMatrix(env, udoff);
  nn_net->udw = makeCMatrix(env, udw);
  nn_net->udwmel = makeCMatrix(env, udwmel);
  nn_net->udwt = makeCMatrix(env, udwt);

  return nn_net;
}
/****************************************************************************/
/*Gets a property value from JS Object                                      */
/* {IN}  env         - N-API environment context                            */
/* {IN}  obj         - N-API_Value containing the object from JS            */
/* {IN}  key         - A string containing the property key                 */
/* {OUT} value       - N-API value containing the property value            */
/****************************************************************************/
napi_status getProperty(napi_env env, napi_value obj, char *key, napi_value *value){
  napi_status status;
  napi_value keyValue;
  
  status = napi_create_string_utf8(env, key, (size_t) (sizeof(char) * (strlen(key))), &keyValue);
  if(status != napi_ok) return status;
  
  status = napi_get_property(env, obj, keyValue, value);
  if(status != napi_ok) return status;

  return napi_ok;
}

napi_status getString(napi_env env, napi_value stringObj, char **string){
  size_t length;
  napi_status status;

  /*Gets the length of the string into length variable*/
  status = napi_get_value_string_utf8(env, stringObj, NULL, 0, &length);
  if(status != napi_ok) return status;

  /*Allocates the apropriate amount and copies the JavaScript weak typed string into C typed char* */
  *string = (char *) malloc(sizeof(char) * length+1); // +1 for \0 (string termination)
  status = napi_get_value_string_utf8(env, stringObj, *string, length+1, NULL);
  if(status != napi_ok) return status;

  return napi_ok;
}
#pragma endregion fold
void* MLPTrainExecute(napi_env env, void *data){
  struct MLPTrainExecuteData{
    matrix **tempMat, **trainIn, **trainOut;
    mlp_net **neuralNet;
    int numEpochs;
    double alphaVal;
    napi_deferred promise;
  } *dataVar;

  dataVar = (MLPTrainExecuteData *) data;
  
  for (int i = 0; i < dataVar->numEpochs; i++) {
    mlp_train(*dataVar->neuralNet, *dataVar->trainIn, *dataVar->trainOut, 20, (float) dataVar->alphaVal);
    ShuffleMat(*dataVar->trainIn, *dataVar->trainOut, *dataVar->tempMat);
  }

  return NULL;
}

void* MLPTrainComplete(napi_env env, napi_status status, void* data){
  napi_value napiNeuralNetObj;
  struct MLPTrainExecuteData{
    matrix **tempMat, **trainIn, **trainOut;
    mlp_net **neuralNet;
    int numEpochs;
    double alphaVal;
    napi_deferred promise;
  } *dataVar;

  dataVar = (MLPTrainExecuteData *) data;
  status = makeMlpnetNodeObj(env, **(dataVar->neuralNet), &napiNeuralNetObj);
  if(status != napi_ok) return NULL;

  napi_resolve_deferred(env, dataVar->promise, napiNeuralNetObj);

  killmat(dataVar->tempMat);
  killmat(dataVar->trainIn);
  killmat(dataVar->trainOut);
  free(dataVar->tempMat);
  free(dataVar->trainIn);
  free(dataVar->trainOut);
  kill_bpenet(dataVar->neuralNet);
  free(dataVar->neuralNet);
  free(dataVar);

  return NULL;
}

/*Module added to node through init function*/
NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
}