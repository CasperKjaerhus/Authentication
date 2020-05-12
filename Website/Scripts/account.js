'use strict';
import {default as Canvas, Drawing} from './canvas_module.js';
import {default as exportStuff} from './utility.js';

const validate        = document.getElementById('validate');
const buttonNext      = document.getElementById('nextDrawing');
const counterElem     = document.getElementById('counter');
const canvasElem      = document.getElementById('drawCanvas');
const clearElem       = document.getElementById('buttonClear');
const canvas          = new Canvas(canvasElem, clearElem);


let data = [];
let counter = 0;
let numCorrect = 3;
let done = 2*numCorrect;
counterElem.innerHTML=`${counter}/${done}`;

//ToDo: Handle succes and fail cases for response
buttonNext.addEventListener('click', e => {
  let drawing = canvas.currDrawing;

  /* Check if drawing consist of enough raw-data/data points to be represented by 100 values
     and ready data for export and copy into data array */
  if (drawing === null || drawing.xArray.length < 100) {
    alert("Too few datapoints! Draw more!");
  } else {  
    drawing.correctDrawing = counter < numCorrect ? true : false;
    exportStuff(drawing);
    data.push(JSON.parse(JSON.stringify(drawing)));
    counterElem.innerHTML=`${counter = counter < done ? counter+1 : done}/${done}`;
    cleanUp(drawing);
  }

  if (counter === done) {
    buttonNext.disabled = true;
    cleanUp(drawing);

    //Ready data for export and copy into data array
    exportStuff(drawing);
    data.push(JSON.parse(JSON.stringify(drawing)));

    let drawingData = JSON.stringify({username: validate.value, drawings: data});

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
          } else if (response.status <= 399) {
            alert("SUCCES!");
          }
        }
      )
      .catch(function(err) {
        console.log('Fetch Error :-S', err);
      });
  }
});

/* TODO: 
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


function cleanUp(drawing) {
    //Clear canvas and enable next drawing
    drawing.startedDrawing = false;
    drawing.clear(canvas);
}