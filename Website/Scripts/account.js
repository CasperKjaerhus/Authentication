'use strict';
import {default as Canvas, Drawing, smallestX as minX, smallestY as minY} from './canvas_module.js';

const validate        = document.getElementById('validate');
const buttonNext      = document.getElementById('nextDrawing');
const counterElem     = document.getElementById('counter');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const canvas          = new Canvas(canvasElem, clearElem);


let data = [];
let counter = 1;
let done = 2;
counterElem.innerHTML=`${counter}/${done}`;

//ToDo: Handle succes and fail cases for response
buttonNext.addEventListener('click', e => {
  let drawing = canvas.currDrawing;
  if (counter < done) {

    //Ready data for export and copy into data array
    exportStuff(drawing);

    //Increment counter and html-counter. Also clear canvas and enable next drawing
    counter++;
    counterElem.innerHTML=`${counter}/${done}`;
    drawing.startedDrawing = false;
    drawing.clear(canvas);

  } else if (counter === done) {
    //Final packing of drawing data into json object
    exportStuff(drawing);
    let drawingData = JSON.stringify({username: validate.value, drawings: data});

    //Clear canvas
    drawing.startedDrawing = false;
    drawing.clear(canvas);

    // Setup url and parameters (method & body) for fetch call
    const url = "/createaccount/";
    const parameters = {
      method: "POST",
      body: drawingData
    };


    fetch(url, parameters)
      .then(
        function(response) {
          if (response.status > 399) { 
            console.log('Looks like there was a problem. Status Code: ' + response.status);
            return;
          }
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
  }

});

/* TODO: 
   Server-side: Check for existing usernames in the database/filestructure, and send corresponding response on validation check
   Client-side: Handle response
*/
validate.addEventListener('change', e => {
  const url = "/checkusername/";

  const parameters = {
    method: "POST",
    body: validate.value
  };

  fetch(url, parameters)
    .then(
      function(response) {
        if (response.status > 399) {
          console.log('Looks like there was a problem. Status Code: ' + response.status);
        }
        else if (response.body === 'taken') {
          //ToDo: Update display for user to indicate invalid username (mainly css changes)
        }
        else if (response.body === 'not taken') {
          //ToDo: Update display for user to indicate valid username (mainly css changes)
        }
      }
    )
    .catch(function(err) {
      console.log('Fetch Error: ', err);
    });


});


// Shrinks the object for export to server to desired inputsize
function exportStuff(drawing){

  const groups = 100;
  let subArraySize = Math.ceil(drawing.xArray.length/groups);

  drawing.xArray.forEach(x => x - minX);
  drawing.yArray.forEach(y => y - minY);

  //drawing[property].forEach(element => console.log(element, minX));

  for (let property in drawing) { 

    if (property !== 'startedDrawing') {

      for (let i = 0; i < groups; i++) {
      
        // If catches event where less than
        //if (i + subArraySize <= drawing[property].length) {
        if (((i + subArraySize) <= drawing[property].length) && ((drawing[property].length - subArraySize) > groups)) {
          const averageSubArray = drawing[property].slice(i, i + subArraySize);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;
         
          console.log(`if statement:  i = ${i} arrayLength = ${drawing[property].length} subArraySize = ${subArraySize}  averageSubArray = ${averageSubArray}`)

          drawing[property].splice(i, subArraySize, averageCalc);
        } /*else {
          console.log(`Something went wrong. i = ${i}, drawing[porperty].length = ${drawing[property].length}, subArraySize = ${subArraySize}`);
          console.log(`${((i + subArraySize) <= drawing[property].length)} && ${((drawing[property].length - (i + subArraySize)) > groups)}`);
        }*/
        
        else if (groups % i !== 0) {

          let subArraySize = drawing[property].length - i;

          //den her kan noget næsten
          subArraySize = subArraySize/2 >= 1 && (drawing[property].length - subArraySize) > groups ? subArraySize : 1;

          const averageSubArray = drawing[property].slice(i, i + subArraySize);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

          console.log(`else statement:  i = ${i} arrayLength = ${drawing[property].length} subArraySize = ${subArraySize}  averageSubArray = ${averageSubArray}`)

          drawing[property].splice(i, subArraySize, averageCalc);
        }
        
      }
    }
  }
  //drawing.xArray.forEach(x => x - minX);
  //drawing.xArray.forEach(element => console.log(element, minX));

  console.log(`done:  arrayLength = ${drawing.xArray.length}\n xArray: ${drawing.xArray[drawing.xArray.length-3]}\n${drawing.xArray[drawing.xArray.length-2]}\n${drawing.xArray[drawing.xArray.length-1]}\n`)
  data.push(JSON.parse(JSON.stringify(drawing)));
}

