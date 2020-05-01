'use strict';

import {smallestX as minX, smallestY as minY} from './canvas_module.js';

// Shrinks the object for export to server to desired inputsize
export default function exportStuff(drawing){

  //Init number of groups and subArraySize for each group
  const groups = 100;
  const subArraySize = Math.ceil(drawing.xArray.length/groups);

  //Correction of drawing position
  drawing.xArray.forEach(x => x - minX);
  drawing.yArray.forEach(y => y - minY);

  for (let property in drawing) { 

    if (property !== 'startedDrawing') {

      for (let i = 0; i < groups; i++) {
      
        // If should catch the event in which: a) we are not yet done, b) the current index/group (i) + the size of this group should not reduce the array below a length of 100
        if (((i + subArraySize) <= drawing[property].length) && ((drawing[property].length - subArraySize) > groups)) {
                    
          averageReduce(drawing[property], i, subArraySize);
        // Else handle event where either of the above if-conditions are false.
        } else {

          //Set size for remaining groups, elements and size of each group
          const remaindingElem = drawing[property].length - i;
          const remaindingGroups = groups-i; 
          const size  = Math.ceil(remaindingElem/remaindingGroups);

          averageReduce(drawing[property], i, size);
        }
        
      }
    }
  }

  console.log(`done:  arrayLength = ${drawing.xArray.length}\n xArray: ${drawing.xArray[drawing.xArray.length-3]}\n${drawing.xArray[drawing.xArray.length-2]}\n${drawing.xArray[drawing.xArray.length-1]}\n`)
}

function averageReduce(array, i, subArraySize) {
  const averageSubArray = array.slice(i, i + subArraySize);
  const averageCalc = averageSubArray.reduce((a, b) => a+b, 0) / subArraySize;

  array.splice(i, subArraySize, averageCalc);
}
