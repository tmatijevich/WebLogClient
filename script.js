// Allow user to set the size of the table, the WebLog should match this constant
const numRecords = 20;
const taskName = "WebLog";
const logbooks = ["System", // The order must match the initialization routine in WebLog
  "Fieldbus",
  "Connectivity",
  "Text System",
  "Access & Security",
  "Visualization",
  "Firewall",
  "Version Info",
  "Diagnostics",
  "User"];

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
        <td id="r${i}index">&nbsp;</td>
        <td id="r${i}severity"></td>
        <td id="r${i}time"></td>
        <td class="tooltip" id="r${i}id"></td>
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

  filterContent = "";
  for(let i = 0; i < logbooks.length; i++) {
    filterContent += `<label for="${filterName(logbooks[i])}"> <input type="checkbox" id="${filterName(logbooks[i])}"> ${logbooks[i]} </label>`
    filterContent += "<br>";
  }

  document.getElementById("weblog-filter").innerHTML = filterContent;

  for(let i = 0; i < logbooks.length; i++) {
    checkbox = document.getElementById(filterName(logbooks[i]));
    checkbox.checked = true;
    checkbox.addEventListener("click", (event) => {
      console.log(event.target.checked);
      accessPV(`${taskName}:book[${i}].search.filter`, event.target.checked ? 0 : 1);
    });
  }

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
    request.open(method = "POST", url = "../goform/ReadWrite", async = true); // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
    
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
    let data = "redirect=log/response.asp&variable=" + escape(tag); // Redirect to WebPrint call, escape tag characters for url
    data += "&value=" + (readPV ? "none&read=1" : val.toString() + "&write=1"); // No value for read and value for write
    console.log("  " + data);
    request.send(data);
  });
}

function userCommand(cmd) {
  // Clear data
  for(let i = 1; i <= numRecords; i++) {
    document.getElementById(`r${i}index`).innerHTML = "&nbsp;";
    document.getElementById(`r${i}severity`).innerHTML = "";
    document.getElementById(`r${i}time`).innerHTML = "";
    document.getElementById(`r${i}id`).innerHTML = "";
    document.getElementById(`r${i}logbook`).innerHTML = "";
    document.getElementById(`r${i}object`).innerHTML = "";
    document.getElementById(`r${i}description`).innerHTML = "";
    document.getElementById(`r${i}ascii`).innerHTML = "";
  }
  
  accessPV(taskName + ":" + cmd, 1).then(() => { // Set refresh command
    return checkDone(); // Check for done status true every XXX ms or until timeout
  }).then(() => {
    return accessPV(taskName + ":" + cmd, 0); // Reset refresh command
  }).then(() => {
    console.log("User command complete");
    refreshTable(); // Refresh table data with latest records
  }).catch(e => {
    accessPV(taskName + ":" + cmd, 0).then(() => { // Still reset the refresh command
      console.log("User command reset");
    }).catch(e => {
      console.log("Unable to reset user command: " + e);
    }); 
    console.log("User command incomplete: " + e);
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
        console.log("Display update done");
        return; // End while loop
      }
      else if(pvValue.trim() == "Unknown variable") {
        throw pvValue.trim();
      }
    }
    catch {
      throw "Error reading done status";
    }
  }
  throw `Check done timeout after ${timeElapsed} ms`;
}

async function refreshTable() {
  const response = await fetch("table.asp");
  const tableData = await response.json();

  let tableOffset = parseInt(tableData[0].tableOffset.trim());

  for(let i = 1; i <= numRecords; i++) {
    // severity
    let severityText = "";
    switch(parseInt(tableData[i].severity.trim())) {
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
        continue;
    }
    document.getElementById(`r${i}severity`).innerHTML = severityText;

    // index
    document.getElementById(`r${i}index`).innerHTML = tableOffset + i;
    
    // event or error number
    if(tableData[i].event.trim() == "0") {
      document.getElementById(`r${i}id`).innerHTML = tableData[i].errorNumber.trim();
    }
    else {
      let eventText = tableData[i].event.trim();
      let facility = (parseInt(tableData[i].event.trim()) >>> 16) & 0xFFF;
      eventText += `<span class="tooltiptext">Facility = ${facility}<br>`;
      let code = parseInt(tableData[i].event.trim()) & 0xFFFF;
      eventText += `Code = ${code}</span>`;
      document.getElementById(`r${i}id`).innerHTML = eventText;
    }
    
    // time
    let timeVal = new Date(tableData[i].sec * 1000);
    let timestamp = String(timeVal.getFullYear()).padStart(4, "0");
    timestamp += "-" + String(timeVal.getMonth() + 1).padStart(2, "0");
    timestamp += "-" + String(timeVal.getDate()).padStart(2, "0");
    timestamp += " / ";
    timestamp += String(timeVal.getHours()).padStart(2, "0");
    timestamp += ":" + String(timeVal.getMinutes()).padStart(2, "0");
    timestamp += ":" + String(timeVal.getSeconds()).padStart(2, "0");
    timestamp += "." + ((tableData[i].nsec % 1000000000) / 1000000).toFixed().padStart(3, "0");
    timestamp += ((tableData[i].nsec % 1000000) / 1000).toFixed().padStart(3, "0");
    document.getElementById(`r${i}time`).innerHTML = timestamp;

    // logbook, object, description, ascii
    document.getElementById(`r${i}logbook`).innerHTML = tableData[i].logbook.trim();
    document.getElementById(`r${i}object`).innerHTML = tableData[i].object.trim();
    document.getElementById(`r${i}description`).innerHTML = tableData[i].description.trim();
    document.getElementById(`r${i}ascii`).innerHTML = tableData[i].asciiData.trim();
  }
}

function filterName(logbook) {
  return "filter-" + logbook.split(" ")[0].toLowerCase();
}
