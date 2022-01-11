console.log("Run script file")
// Create a log table with fixed columns and variable rows


const readPV = function(tag) {
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
        console.log(tag + "=" + request.responseText);
      }
      else { 
        console.log("Request did not complete successfully");
      }
    }
  }

  // Send request data
  let data = "redirect=response.asp&variable=" + escape(tag) + "&value=none&read=1";
  console.log(data);
  request.send(data);

}

console.log("Test readPV()")
readPV("WebLogger:refresh");
