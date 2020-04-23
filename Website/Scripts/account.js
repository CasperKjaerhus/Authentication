'use strict';
//ToDo: Import and export of modules such that buttonNext.addEventListener can clear canvas etc.
import {Canvas, Drawing} from './canvas_module.js';
let drawing = undefined; 

const validate        = document.getElementById('validate');
const buttonNext      = document.getElementById('nextDrawing');
const formElem        = document.getElementById('accountForm');
const counterElem     = document.getElementById('counter');
const canvas          = new Canvas('drawCanvas', drawing);

let data = undefined; 
let counter = 1;
let done = 10;

counterElem.innerHTML=`${counter}/${done}`;

//ToDo: Fix fetch request and response handling
buttonNext.addEventListener('click', e => {
  if (counter < done) {
    drawing.exportStuff();
    data.append('drawing', JSON.stringify(drawing));
    canvas.drawing.clear(canvas.context);
    //clear button
    counter++;
    counterElem.innerHTML=`${counter}/${done}`

  } else if (counter === done) {
    drawing.exportStuff();
    data.append('drawing', JSON.stringify(drawing));
    //Clear canvas call
   

    const url = "/submit/";
    const parameters = {
        method: "POST",
        body: data
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
   Server-side: Check for existing usernames in the database/filestructure, and send corresponding response
   Client-side: Handle response
*/
validate.addEventListener('onblur', e => {
  const url = "/username/";
  data = new FormData(formElem);

  const parameters = {
    method: "GET",
    body: data
  };

  fetch(url, parameters)
    .then(
      function(response) {
        if (response.status > 399) { 
          console.log('Looks like there was a problem. Status Code: ' + response.status);
          return;
        }
        else if (response === 'taken'){
          //ToDo: Update display for user to indicate invalid username
        }
        else if (response === 'not taken'){
          //ToDo: Update display for user to indicate valid username
        }
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });


});