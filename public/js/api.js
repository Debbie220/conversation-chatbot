// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var dialogStack = new Array();
  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    dialogStack: dialogStack,
    // The request/response getters/setters are defined here to prevent internal methods
    // from calling th e methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr);
    },
    removeFromDialogStack: function() {
      dialogStack.pop();
    },
    fixContextAfterGoingBack: function() {
      //console.log("responsePayload; ", responsePayload);
      responsePayload.context.system.dialog_stack[0] = dialogStack[dialogStack.length-1];
      //return responsePayload;
    },
    //stacking up the node of each response payload
    addOnDialogStack: function(payload) {
        console.log("DIALOG STACCKKSKSKKSKSKKSKSKKSKSKKSKSKKSKSKKS: ", dialogStack);
        dialogStack.push(payload.context.system.dialog_stack[0]);
      //}
    }
  };

  // Send a message request to the server
  function sendRequest(text, context) {
    // Build request payload
    var payloadToWatson = {};
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    if (context) {
      payloadToWatson.context = context;

    }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        console.log("Response Text: ", http.responseText);
        Api.setResponsePayload(http.responseText);
        Api.addOnDialogStack(JSON.parse(http.responseText));
      }
    };

    var params = JSON.stringify(payloadToWatson);
    //console.log(JSON.stringify(payloadToWatson));
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }
    console.log("PARAMS SENT TO WATSON: ", params);
    // Send request
    http.send(params);
  }
}());
