console.log("Run script file")

// Create a log table with fixed columns and variable rows
window.onload = function() {
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

  for(let i = 1; i <= 20; i++) {
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

  document.getElementById("weblog-content").innerHTML = tableContent;
  console.log("Table content set");
};

function accessPV(tag, val, callback) {
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
  const request = new XMLHttpRequest(); // New object from constructor`
  request.open(method = "POST", url = "goform/ReadWrite", async = true); // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/open
  
  //Program the event handler
  request.onreadystatechange = function () {
    if(request.readyState == XMLHttpRequest.DONE) {
      if(request.status === 0 || 200 <= request.status && request.status < 400) {
        console.log(tag + (typeof val === "undefined" ? " --> " : " <-- ") + request.responseText);
        try {callback(request.responseText);} catch {console.log("No callback function")};
      }
      else { 
        console.log((typeof val === "undefined" ? "Read" : "Write") + " request unsuccessful");
      }
    }
  }

  // Send request data
  let data = "redirect=response.asp&variable=" + escape(tag) + "&value=" + (typeof val === "undefined" ? "none&read=1" : val.toString() + "&write=1");
  console.log(data);
  request.send(data);
}

function refreshLog() {
  for(let i = 1; i <= 20; i++) {
    accessPV(`WebLogger:display[${i-1}].timestamp`, undefined, (val) => {document.getElementById(`r${i}time`).innerHTML = val;});
  }
}

const refreshButton = function() {
  accessPV("WebLogger:refresh", 1);
  setTimeout(() => {
    refreshLog();
  }, 10000);
};

console.log("Test readPV()");
accessPV("WebLogger:refresh");
