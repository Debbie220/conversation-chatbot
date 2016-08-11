function createFile(textToWrite){
  var data = new XMLHttpRequest();
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open( 'post', '/saveFile', true );
  xhr.send(data);
}

function deleteFile() {
  var data = new XMLHttpRequest();
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open( 'post', '/deleteFile', true );
  xhr.send(data);
}

function editFile() {
  var data = new XMLHttpRequest();
  var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
  xhr.open( 'post', '/editFile', true );
  xhr.send(data);
}
