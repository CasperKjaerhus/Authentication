'use strict';
import {default as Canvas, Drawing} from './canvas_module.js';

const validate        = document.getElementById('validate');
const buttonNext      = document.getElementById('nextDrawing');
const counterElem     = document.getElementById('counter');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const canvas          = new Canvas(canvasElem, clearElem);


let data = [];
let counter = 1;
let done = 10;
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
  const url = "/checkmig123/";                            // fix STRING

  const parameters = {
    method: "POST",
    body: validate.value
  };

  fetch(url, parameters)
    .then(
      function(response) {
        if (response.status > 399) { 
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          return;
        }
        else if (response === 'taken'){
          //ToDo: Update display for user to indicate invalid username (mainly css changes)
        }
        else if (response === 'not taken'){
          //ToDo: Update display for user to indicate valid username (mainly css changes)
        }
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });


});


// Shrinks the object for export to server to desired inputsize
function exportStuff(drawing){

  let groups = 100;
  let subArraySize = Math.ceil(drawing.xArray.length/groups);
  let done = false;
  
  for (let property in drawing) { 
    if (property !== 'startedDrawing') {        
        for (let i = 0; i < groups && done === false; i++) {
        
        // If catches event where less than 
        if (i + subArraySize < groups ) {
          const averageSubArray = drawing[property].slice(i, i + subArraySize);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

          drawing[property].splice(i, subArraySize, averageCalc);
        }
        else {
          const averageSubArray = drawing[property].slice(i, drawing[property].length - 1);
          const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / ((drawing[property].length - 1)  - i);

          drawing[property].splice(i, (drawing[property].length - 1) - i, averageCalc);
          done = true;
        }
      }
    }
  }

  data.push(JSON.parse(JSON.stringify(drawing)));
}

