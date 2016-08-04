/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require('dotenv').config({silent: true});

var express = require('express');  // app server
var bodyParser = require('body-parser');  // parser for post requests
var watson = require('watson-developer-cloud');  // watson sdk
var fs = require('fs');
var nodemailer = require('nodemailer');

var app = express();
var status= null;
var fileForChatLog=null;
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Create the service wrapper
var conversation = watson.conversation({
  url: 'https://gateway.watsonplatform.net/conversation/api',
  username: process.env.CONVERSATION_USERNAME || 'ebdcdb0b-5d3c-4f55-b504-96f160188a71',
  password: process.env.CONVERSATION_PASSWORD || 'TUXK3UUehrHa',
  version_date: '2016-07-11',
  version: 'v1'
});

/*
* Just for creating the file when the user initially starts chatting
*/
app.post('/saveFile', function(req, res) {
  return createFile();
});

function createFile(){
  var file_name = "user"+uniqueid();
  var path= "./Chat_logs/"+file_name;
  fileForChatLog = path;
  fs.writeFileSync(fileForChatLog, '');
}

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '1a0ef03b-34fb-4463-b78b-a460e13b94b6';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({'output': {'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
    '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' +
      'Once a workspace has been defined the intents may be imported from ' +
    '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_intents.csv">here</a> in order to get a working application.'}});
  }
  var payload = {
    workspace_id: workspace,
    context: {}
  };
  if (req.body) {
    if (req.body.input) {
      payload.input = req.body.input;
      updateChatLog(req.body.input.text, '<b>user</b>');
    }
    if (req.body.context) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }
  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      console.log(err);
      return res.status(err.code || 500).json(err);

    }
    //console.log("DATA: ", data);
    return res.json(updateMessage(data));
  });
});

/**
* Gotten from stackOverflow
* generates a unique Id
*/
function uniqueid(){
    // always start with a letter (for DOM friendlyness)
    var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
    do {
        // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
        var ascicode=Math.floor((Math.random()*42)+48);
        if (ascicode<58 || ascicode>64){
            // exclude all chars between : (58) and @ (64)
            idstr+=String.fromCharCode(ascicode);
        }
    } while (idstr.length<32);
    console.log("TELLME THE FILE OOOOOOOOOOOOOO: ",fileForChatLog);
    return (idstr);
}

/**
* It saves the chat messages in a file and sends them to IST
* once it is done answering a question
*/
function updateChatLog(text, user) {
  console.log("Going to write into existing file");
  console.log("FILE PASTHHHHHHHHH: ", fileForChatLog);
  fs.appendFileSync(fileForChatLog, user+': '+text+"<br>");
}

function fileContent(fileToRead){
  var dataInfo=null;
  dataInfo = fs.readFileSync(fileForChatLog,'utf8');
  return dataInfo;
}

/**
* if answered or not clear send email and then clear chat log
*/
function sendChat(fileToRead){
  //send email
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport('smtps://istchatbot%40gmail.com:rockmyWorld@smtp.gmail.com');
  var mailContent = fileContent(fileToRead);
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: '"IST ChatBot" <istchatbot@gmail.com>', // sender address
      to: 'detsenak@ualberta.ca', // list of receivers
      subject: status, // Subject line
      html: mailContent // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
  //delete all contents of chat log file
  fs.writeFile(fileToRead,'');
}

/**
 * Updates the response text using the intent confidence
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(response) {
  var responseText = null;
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    if (!response.output) {
      response.output = {};
    }
    else{
      updateChatLog(response.output.text, '<b>watson</b>');
    }
    //saving the role as a context variable
    if(response.output.role){
      response.context.role = response.output.role;
    }

    //this will not work if the location of the alternative nodes where the intents are checked is moved
    if(response.context.system.dialog_stack[0] == "root"){
      response.context.system.dialog_stack[0] = "node_5_1467908868729";
    }
    if(response.output.answered){
      console.log("answered value:   ", response.output.answered);
      if(response.output.answered == 'yes'){
        status = "SOLVED";
        //call function to send email and empty chat log file
        sendChat(fileForChatLog);
      }
      else{
        status = "UNSOLVED";
        //call function to send email and empty chat log file
        sendChat(fileForChatLog);
      }
    }
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent. In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  //response.output.text = responseText;
  return response;
}
module.exports = app;
