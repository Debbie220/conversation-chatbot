$(window).on('mouseover', (function () {
    window.onbeforeunload = null;
}));
$(window).on('mouseout', (function () {
    window.onbeforeunload = deleteFile;
}));

var prevKey="";
$(document).keydown(function (e) {
    if (e.key=="F5") {
        window.onbeforeunload = deleteFile;
    }
    else if (e.key.toUpperCase() == "W" && prevKey == "CONTROL") {
        window.onbeforeunload = deleteFile;
    }
    else if (e.key.toUpperCase() == "R" && prevKey == "CONTROL") {
        window.onbeforeunload = deleteFile;
    }
    else if (e.key.toUpperCase() == "F4" && (prevKey == "ALT" || prevKey == "CONTROL")) {
        window.onbeforeunload = deleteFile;
    }
    prevKey = e.key.toUpperCase();
});
