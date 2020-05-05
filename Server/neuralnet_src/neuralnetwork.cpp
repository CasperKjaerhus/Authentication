#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include <time.h>
#include "matlib.h"
#include "neu.h"

namespace neuralnetwork {

typedef struct{
  napi_value *inw,*udw,*inoff,*udoff, *udwt, *indwt, *inwmel, *udwmel;
  napi_value *fejl1, *fejl2, *melres1, *melres2, *melres3;
  napi_value *out0, *out1;
  napi_value *numNodesIn, *numNodesHiddenLayer, *numNodesOut;
} napi_value_mlp_net;

/*Function headers*/

napi_status makeMatrixNodeObj(napi_env env, matrix* mat, napi_value* matrixObj);
napi_status makeMlpnetNodeObj(napi_env env, mlp_net nn_net, napi_value* mlpnetVal);
matrix* makeCMatrix(napi_env env, napi_value mat);
mlp_net* makeCMlp_net(napi_env env, napi_value nn_netVal);
napi_value loadMatrix(napi_env env, napi_callback_info cbinfo);
napi_value normalizeMatrix(napi_env env, napi_callback_info cbinfo);
napi_value normalizeMatrixWithExt(napi_env env, napi_callback_info cbinfo);
napi_value gaussinit(napi_env env, napi_callback_info cbinfo);
napi_status getProperty(napi_env env, napi_value obj, char *key, napi_value *value);

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value loadMatrixFn, normalizeMatrixfn, normalizeMatrixWithExtfn, gaussinitfn;

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

  return exports;
}

/*exported functions below here*/
napi_value loadMatrix(napi_env env, napi_callback_info cbinfo) {

  char* fileLocation;
  size_t length;

  matrix* mat;

  napi_value parameters[1], matrixObj;
  size_t parametersAmount = 1;

  /*Getting the parameters sent from JavaScript call, into parameters array*/
  napi_status status = napi_get_cb_info(env, cbinfo, &parametersAmount, parameters, NULL, NULL);
  if(status != napi_ok) return NULL;

  /*Gets the length of the string into length variable*/
  status = napi_get_value_string_utf8(env, parameters[0], NULL, 0, &length);
  if(status != napi_ok) return NULL;
  
  /*Allocates the apropriate amount and copies the JavaScript weak typed string into C typed char* */
  fileLocation = (char *) malloc(sizeof(char) * length+1); // +1 for \0 (string termination)
  status = napi_get_value_string_utf8(env, parameters[0], fileLocation, length+1, NULL);
  if(status != napi_ok) return NULL;

  /*Loading and creation of matrix object*/
  loadMattxt(fileLocation,  &mat);
  makeMatrixNodeObj(env, mat, &matrixObj);

  /*Frees allocated memory space*/
  killmat(&mat);

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

  napi_value initNet;
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
/*Makes a JavaScript object from a matrix                                   */
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

napi_status makeMlpnetNodeObj(napi_env env, mlp_net nn_net, napi_value* mlpnetVal){
  napi_status status;
  napi_value_mlp_net mlp_net_value;
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

mlp_net* makeCMlp_net(napi_env env, napi_value nn_netVal){
  napi_status status;
  napi_value_mlp_net mlp_netValue;

  mlp_net *nn_net = (mlp_net *) calloc(sizeof(mlp_net), 1);

  /*Long chain of getting properties out of NodeJS Objects :(*/
  status = getProperty(env, nn_netVal, "inw", mlp_netValue.inw);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udw", mlp_netValue.udw);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "fejl1", mlp_netValue.fejl1);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "fejl2", mlp_netValue.fejl2);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "indwt", mlp_netValue.indwt);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "inoff", mlp_netValue.inoff);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "inwmel", mlp_netValue.inwmel);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres1", mlp_netValue.melres1);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres2", mlp_netValue.melres2);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "melres3", mlp_netValue.melres3);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "out0", mlp_netValue.out0);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "out1", mlp_netValue.out1);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udoff", mlp_netValue.udoff);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udwmel", mlp_netValue.udwmel);
  if(status == napi_ok) return NULL;
  status = getProperty(env, nn_netVal, "udwt", mlp_netValue.udwt);
  if(status == napi_ok) return NULL;

  /*Transfering values into struct*/
  nn_net->fejl1 = makeCMatrix(env, *(mlp_netValue.fejl1));
  nn_net->fejl2 = makeCMatrix(env, *(mlp_netValue.fejl2));
  nn_net->indwt = makeCMatrix(env, *(mlp_netValue.indwt));
  nn_net->inoff = makeCMatrix(env, *(mlp_netValue.inoff));
  nn_net->inw = makeCMatrix(env, *(mlp_netValue.inw));
  nn_net->inwmel = makeCMatrix(env, *(mlp_netValue.inwmel));
  nn_net->melres1 = makeCMatrix(env, *(mlp_netValue.melres1));
  nn_net->melres2 = makeCMatrix(env, *(mlp_netValue.melres2));
  nn_net->melres3 = makeCMatrix(env, *(mlp_netValue.melres3));
  nn_net->out0 = makeCMatrix(env, *(mlp_netValue.out0));
  nn_net->out1 = makeCMatrix(env, *(mlp_netValue.out1));
  nn_net->udoff = makeCMatrix(env, *(mlp_netValue.udoff));
  nn_net->udw = makeCMatrix(env, *(mlp_netValue.udw));
  nn_net->udwmel = makeCMatrix(env, *(mlp_netValue.udwmel));
  nn_net->udwt = makeCMatrix(env, *(mlp_netValue.udwt));

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

/*Module added to node through init function*/
NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
}