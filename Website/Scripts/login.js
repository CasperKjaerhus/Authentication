'use strict';

const buttonSubmit = document.getElementById('loginButton');
const formElem = document.getElementById('loginForm');

/* Button for submitting draw data */
buttonSubmit.addEventListener('click', e =>  {
 
  drawing.exportStuff();

  const url = "/submit/";
  let data = new FormData(loginForm);
  data.append(JSON.stringify(drawing));

  drawing.clear();

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
});
