function writeToFile(textToWrite){
  //var data = new XMLHttpRequest();
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open( 'get', '/saveFile', true );
  //xhr.send(data);
}
