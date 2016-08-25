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
    sendMessage: sendMessage,
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
    modifyResponseText: function(new_text) {
      responsePayload.output.text= new_text;
      return JSON.stringify(responsePayload);
    },
    removeFromDialogStack: function() {
      dialogStack.pop();
    },
    /*
    * This function is for changing the number on the dialog stack
    * when the chatbot has to be reverted to an previous state.
    */
    fixContextAfterGoingBack: function() {
      responsePayload.context.system.dialog_stack[0] = dialogStack[dialogStack.length-1];
    },
    /*
    * It stacks up all the nodes that have been visited during the conversation
    */
    addOnDialogStack: function(payload) {
        dialogStack.push(payload.context.system.dialog_stack[0]);
    },
    clearDialogStack: function(){
      dialogStack.length = 0;
    },
    re_initializing: function(payload){
      if(payload.output.re_init){
        Api.clearDialogStack();
        var newFirst = $('#scrollingChat').children().last().detach();
        $('#scrollingChat').empty().append(newFirst);
        checkNumberOfChatColumns();
        window.scrollTo(0,0);
      }
    }
  };

  function sendMessage(text, context){
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
    http.open('post', '/server/message', true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        //console.log("Response Text: ", http.responseText);
        var new_payload = Api.modifyResponseText(JSON.parse(http.responseText).output.text);
        Api.setResponsePayload(new_payload);
        console.log("NEW PAYLOAD: ", new_payload);
        //re-initialzing chat if chat_log has been sent
        Api.re_initializing(JSON.parse(http.responseText));
        Api.deleteAttributeOffResponsePayload(JSON.parse(new_payload).output.re_init);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    //console.log("PARAMS SENT TO WATSON: ", params);
    // Send request
    http.send(params);

  }

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
        //console.log("Response Text: ", http.responseText);
        Api.setResponsePayload(http.responseText);
        Api.addOnDialogStack(JSON.parse(http.responseText));
        //re-initialzing chat if chat_log has been sent
        Api.re_initializing(JSON.parse(http.responseText));
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
