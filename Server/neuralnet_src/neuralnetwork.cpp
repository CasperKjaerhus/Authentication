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
napi_value loadMatrix(napi_env env, napi_callback_info cbinfo);
matrix* makeCMatrix(napi_env env, napi_value mat);
napi_value normalizeMatrix(napi_env env, napi_callback_info cbinfo);


napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value loadMatrixFn, normalizeMatrixfn;

  status = napi_create_function(env, NULL, 0, loadMatrix, NULL, &loadMatrixFn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "loadMatrix", loadMatrixFn);
  if (status != napi_ok) return NULL;

  status = napi_create_function(env, NULL, 0, normalizeMatrix, NULL, &normalizeMatrixfn);
  if(status != napi_ok) return NULL;

  status = napi_set_named_property(env, exports, "normalizeMatrix", normalizeMatrixfn);
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
  napi_value matrixObj, values, matrixNormalizedObj;
  size_t parametersAmount = 1;
  matrix *matOriginal, *matExt, *matNormalized;

  napi_status status = napi_get_cb_info(env, cbinfo, &parametersAmount, &matrixObj, NULL, NULL);
  if(status != napi_ok) return NULL;

  matOriginal = makeCMatrix(env, matrixObj);

  initmat(&matExt, matOriginal->cols, 2, 0.0);
  initmat(&matNormalized, matOriginal->rows, matOriginal->cols, 0.0);

  matnormp(matOriginal, &matNormalized, &matExt, 1);
  
  makeMatrixNodeObj(env, matNormalized, &matrixNormalizedObj);

  return matrixNormalizedObj;
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

matrix* makeCMatrix(napi_env env, napi_value mat){
  napi_value keyRows, keyCols, keyValues, rows, cols, values;
  napi_status status;

  int valRows, valCols;
  float *valValues;

  matrix *matC;
  /*Creates property key strings*/
  status = napi_create_string_utf8(env, "rows", (size_t) (sizeof(char) * 4), &keyRows);
  if(status != napi_ok) return NULL;
  status = napi_create_string_utf8(env, "cols", (size_t) (sizeof(char) * 4), &keyCols);
  if(status != napi_ok) return NULL;
  status = napi_create_string_utf8(env, "values", (size_t) (sizeof(char) * 6), &keyValues);
  if(status != napi_ok) return NULL;

  /*Gets properties*/
  status = napi_get_property(env, mat, keyRows, &rows);
  if(status != napi_ok) return NULL;
  status = napi_get_property(env, mat, keyCols, &cols);
  if(status != napi_ok) return NULL;
  status = napi_get_property(env, mat, keyValues, &values);
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

/*Module added to node through init function*/
NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
}