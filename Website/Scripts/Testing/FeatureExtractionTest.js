'use strict';

let drawing = new Drawing;
let rawData = new Drawing;
drawing = initDrawing(drawing, rawData);

function initDrawing(drawing) {
  for (let property in drawing) { 
    if (property != 'startedDrawing' && property != 'correctDrawing') {
      drawing[property] = initRandomArray(1000);
      rawData[property] = Array.from(drawing[property]);
    }
  }
  return;
}

//Init function for a random array of length 0-1*magnitude, as well as filling the array with 0-1*magnitude elements
// ie. magnitude = 1000, will generate an array of length 0-1000, with elements ranging from 0-1000.
function initRandomArray(magnitude) {
  const initVal = 100;
  const randomVal = Math.ceil(Math.random()*magnitude) + initVal;
  const array = [];
  array.length = randomVal;
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.ceil(Math.random()*magnitude);
  }
  return array;
}

function featureExtractionTest(drawing, rawData) {
  let fails = 0;
  let outputArray =  null;
  const currTime = 1;
  const prevTime = -0.0001;
  for (let property in drawing) { 
    if (property == 'velocities') {
      for (let i = 0; i < drawing[property].length; i++) {
        outputArray = drawing.velocity(currTime, prevTime, drawing.xArray[i], drawing.xArray[i+1], drawing.yArray[i], drawing.yArray[i+1]);
        fails = assert(outputArray[i], rawData[property[i]], fails);
      }
    }
  }
  console.log(fails);
}


//Compare function. Asserting if failed or passed.
function assert(testVal, expectedVal, failures){
  const verdict = testVal === expectedVal ? true : false;
  if (verdict === true) {
    return failures;
  } else {
    return ++failures;
  }
}

featureExtractionTest(drawing, rawData);
