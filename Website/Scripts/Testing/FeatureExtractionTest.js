'use strict';
//Testrunner call
runFeatureExtractionTest(100000);

//Testrunner function
function runFeatureExtractionTest(iterations) {
  let result = 0;

  //Init objects
  let drawing = {xArray: [], yArray: [], gradients: [], velocities: []};
  let rawData = {xArray: [], yArray: [], gradients: [], velocities: []};

  for (let i = 0; i < iterations; i++) {  
    // Fill xArray and yArray of objects
    initDrawing(drawing, rawData, 1000, 100)

    //Call test and record result
    result += featureExtractionTest(drawing, rawData);
  }

  //Final output
  console.log(`${result == 0 ? 'Passed' : 'Failed'}:\n${result}`);
}

//Init xArray and yArray of objects - randomly generated data
function initDrawing(drawing, rawData, magnitude, initVal) {
  const arrayLength = Math.ceil(Math.random()*magnitude) + initVal;

  for (let property in drawing) {
    if (property != 'gradients' && property != 'velocities') {
      drawing[property] = initRandomArray(1000, arrayLength);
      rawData[property] = Array.from(drawing[property]);
    }
  }
}

//Init function for a random array filling the array with 0-1*magnitude elements
// ie. magnitude = 1000, will generate an array with element values ranging from 0-1000.
function initRandomArray(magnitude, arrayLength) {
  const array = [];
  array.length = arrayLength;
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.ceil(Math.random()*magnitude);
  }
  return array;
}

//Feature extraction test for velocity, gradient and euclidean distance
function featureExtractionTest(drawing, rawData) {
  //Init Failure trackers for each sub-test
  let EuclidFails = 0;
  let VelocityFails = 0;
  let GradientFails = 0;
  let totalFails = 0;

  //Init output and expected arrays for each sub-test
  let outputEuclid =  [];
  let outputVelocity =  [];
  let outputGradient = [];
  let expectedEuclid = [];
  let expectedVelocity =  [];
  let expectedGradient = [];

  //Init timevariables for function calls
  const currTime = 1;
  const prevTime = 0.0001;

  for (let property in drawing) { 
    for (let i = 0; i < drawing.xArray.length-1; i++) {
      if (property == 'velocities') {
        const randTime = Math.random();
        const x1 = drawing.xArray[i];
        const x2 = drawing.xArray[i+1];
        const y1 = drawing.yArray[i];
        const y2 = drawing.yArray[i+1];

        //EuclideanDistance unit test (time is constant, time = 1)
        EuclidUnitTest(outputEuclid, expectedEuclid, currTime, prevTime, x1, x2, y1, y2, i);
        EuclidFails = assert(outputEuclid[i], expectedEuclid[i], EuclidFails);

        //Velocity unit test (distance is constant, distance = 5)
        VelocityUnitTest(outputVelocity, expectedVelocity, randTime, prevTime, 4, 1, 6, 2, i);        
        VelocityFails = assert(outputVelocity[i], expectedVelocity[i], VelocityFails);

      } else if (property == 'gradients') {
          // Gradient unit test (lidt iffy, identiske arrays, vi behandler ens, der så ender med at være ens? xd?)
          outputGradient[i]   = gradient(drawing.xArray[i], drawing.yArray[i], drawing.xArray[i+1], drawing.yArray[i+1]);
          expectedGradient[i] = gradient(rawData.xArray[i], rawData.yArray[i], rawData.xArray[i+1], rawData.yArray[i+1]);
          GradientFails = assert(outputGradient[i], expectedGradient[i], GradientFails);
      }
    }
  }

  totalFails = EuclidFails + GradientFails + VelocityFails;
/* Whitebox testing console.logs.
  console.log(outputArrayEuclid[outputArrayEuclid.length-1], expectedArrayEuclid[expectedArrayEuclid.length-1]);
  console.log(outputArrayGradient[outputArrayGradient.length-1], expectedArrayGradient[expectedArrayGradient.length-1]);
  console.log(outputArrayVelocity[outputArrayVelocity.length-1], expectedArrayVelocity[expectedArrayVelocity.length-1]);
*/
  return totalFails;
}

function EuclidUnitTest(outputEuclid, expectedEuclid, currTime, prevTime, x1, x2, y1, y2, i) {
  outputEuclid[i]   = velocity(currTime, prevTime, x1, x2, y1, y2);
  expectedEuclid[i] = euclideanDist(x1, x2, y1, y2);
}


function VelocityUnitTest(outputVelocity, expectedVelocity, currTime, prevTime, x1, x2, y1, y2, i) {
  outputVelocity[i]   = velocity(currTime, prevTime, x1, x2, y1, y2);
  expectedVelocity[i] = 5/currTime;
}

//Compare function. Asserting if failed or passed.
function assert(testVal, expectedVal, failures) {
  const verdict = testVal === expectedVal ? true : false;
  if (verdict === true) {
    return failures;
  } else {
    return ++failures;
  }
}

//Velocity function - part of feature extraction - function to test
function velocity(currTime, prevTime, x1, x2, y1, y2) {
  const distance = euclideanDist(x1, x2, y1, y2);
  return distance/(currTime - prevTime + 0.0001);
}

//Euclidean Distance function - part of feature extraction - function to test
function euclideanDist(x1, x2, y1, y2) {
  return Math.sqrt(Math.pow((x1-x2), 2)+Math.pow((y1-y2), 2));
}

//Gradient function - part of feature extraction - function to test
function gradient(x1, y1, x2, y2) {
  if (x1 !== x2) {
    return (y2-y1)/(x2-x1);
  }
  else {
    return (y2-y1);
  }
}

