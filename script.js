// Allow user to set the size of the table, the WebLog should match this constant
const numRecords = 20;
const taskName = "WebLogger";

console.log("Run script file");

// Create a log table with fixed columns and variable rows
window.onload = () => {
  // Use template strings to handle placeholders and newlines: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
  let tableContent = `
  <table>
    <tr>
      <th>Index</th>
      <th>Severity</th>
      <th>Time</th>
      <th>ID</th>
      <th>Logbook</th>
      <th>Entered by</th>
      <th>Description</th>
      <th>ASCII Data</th>
    </tr>
  `;

  for(let i = 1; i <= numRecords; i++) {
    tableContent += `
      <tr>
        <td id="r${i}c1">${i}</td>
        <td id="r${i}severity"></td>
        <td id="r${i}time"></td>
        <td id="r${i}id"></td>
        <td id="r${i}logbook"></td>
        <td id="r${i}object"></td>
        <td id="r${i}description"></td>
        <td id="r${i}ascii"></td>
      </tr>
    `;
  };
  
  tableContent += "</table>";

  // Reference hard-coded div element in body of page
  document.getElementById("weblog-content").innerHTML = tableContent;
  console.log("Window loaded and table content set");
};

// Create asynchronous function with promise to return read/write value or error
function accessPV(tag, val) {
  return new Promise((resolve, reject) => {
    // Create an asynchronous request object
    /* 
      Browser compatibility: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#browser_compatibility
      Chrome 1
      Edge 12
      Firefox 1
      IE >7
      Opera 8
      Safari 1.2
    */
    const request = new XMLHttpRequest(); // New object from constructor
    request.open(method = "POST", url = "goform/ReadWrite", async = true); // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
    
    let readPV = (typeof val === "undefined" ? true : false);

    // Program the event handler
    request.onreadystatechange = () => {
      if(request.readyState == XMLHttpRequest.DONE) {
        if(request.status === 0 || 200 <= request.status && request.status < 400) {
          console.log("  " + tag + (readPV ? " --> " : " <-- ") + request.responseText);
          resolve(request.responseText);
        }
        else { 
          console.log("  " + (readPV ? "Read" : "Write") + " request unsuccessful");
          reject("Unable to access PV " + tag);
        }
      }
    };

    // Send request data
    let data = "redirect=response.asp&variable=" + escape(tag); // Redirect to WebPrint call, escape tag characters for url
    data += "&value=" + (readPV ? "none&read=1" : val.toString() + "&write=1"); // No value for read and value for write
    console.log("  " + data);
    request.send(data);
  });
}

function pressRefresh() {
  // Clear data
  for(let i = 1; i <= numRecords; i++) {
    document.getElementById(`r${i}severity`).innerHTML = "";
    document.getElementById(`r${i}time`).innerHTML = "";
  }
  
  accessPV(taskName + ":refresh", 1).then(() => { // Set refresh command
    return checkDone(); // Check for done status true every XXX ms or until timeout
  }).then(() => {
    return accessPV(taskName + ":refresh", 0); // Reset refresh command
  }).then(() => {
    console.log("Refresh complete");
    refreshTable(); // Refresh table data with latest records
  }).catch(e => {
    accessPV(taskName + ":refresh", 0).then(() => { // Still reset the refresh command
      console.log("Refresh command reset");
    }).catch(e => {
      console.log("Unable to reset refresh command: " + e);
    }); 
    console.log("Refresh incomplete: " + e);
  });
}

function delay(ms) {
  return new Promise(resolve => {setTimeout(resolve, ms);});
}

async function checkDone() {
  let timeElapsed = 0;
  while(timeElapsed < 2500) {
    await delay(25);
    timeElapsed += 25;
    try {
      let pvValue = await accessPV(taskName + ":done");
      if(pvValue.trim() == "1") {
        console.log("Refresh done");
        return; // End while loop
      }
    }
    catch {
      throw "Error reading done status";
    }
  }
  throw `Check done timeout after ${timeElapsed} ms`;
}

function refreshTable() {
  for(let i = 1; i <= numRecords; i++) {
    // severity
    accessPV(taskName + `:display[${i-1}].severity`).then(pvValue => {
      let severityText = "";
      switch(parseInt(pvValue.trim())) {
        case 0: 
          severityText = "Success";
          break;
        case 1: 
          severityText = "Information";
          break;
        case 2: 
          severityText = "Warning";
          break;
        case 3: 
          severityText = "Error";
          break;
        default: 
          severityText = "Unknown";
          break;
      }
      document.getElementById(`r${i}severity`).innerHTML = severityText;
    }).catch(e => {
      document.getElementById(`r${i}severity`).innerHTML = e;
    });
    
    // time
    accessPV(taskName + `:display[${i-1}].timestamp`).then(pvValue => {
      document.getElementById(`r${i}time`).innerHTML = pvValue.trim();
    }).catch(e => {
      document.getElementById(`r${i}time`).innerHTML = e;
    });
  }
}
