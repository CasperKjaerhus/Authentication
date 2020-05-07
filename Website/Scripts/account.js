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
let counter = 1;
let done = 2;
counterElem.innerHTML=`${counter}/${done}`;

//ToDo: Handle succes and fail cases for response
buttonNext.addEventListener('click', e => {
  let drawing = canvas.currDrawing;
  if (counter < done) {

    //Ready data for export and copy into data array
    exportStuff(drawing);
    data.push(JSON.parse(JSON.stringify(drawing)));

    //Increment counter and html-counter. Also clear canvas and enable next drawing
    counter++;
    counterElem.innerHTML=`${counter}/${done}`;
    drawing.startedDrawing = false;
    drawing.clear(canvas);

  } else if (counter === done) {
    //Final packing of drawing data into json object
    exportStuff(drawing);
    data.push(JSON.parse(JSON.stringify(drawing)));

    let drawingData = JSON.stringify({username: validate.value, drawings: data});

    //Clear canvas
    counter++;
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