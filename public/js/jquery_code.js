function checkNumberOfChatColumns(){
  //console.log("AM HERE", $("#scrollingChat").children().length);
  if($("#scrollingChat").children().length > 1){
    document.getElementById('previous_menu').style.visibility = 'visible';
  }
  else{
    document.getElementById('previous_menu').style.visibility = 'hidden';
  }
}
$(document).ready(function() {
    //for making the header fixed on scroll
    var $header = $("#header"),
        $clone = $header.before($header.clone().addClass("clone"));

    $(window).on("scroll", function() {
        var fromTop = $(window).scrollTop();
        $("body").toggleClass("down", (fromTop > 100));
    });

    $('#previous_menu').click(function() {
      $(".from-watson .latest").removeClass('latest');
      $(".from-user .latest").removeClass('latest');
      //removing both the latest input field and the latest watson response
      $("#scrollingChat").children().last().remove();
      $("#scrollingChat").children().last().remove();
      $(".from-watson").last().addClass('latest');
      $(".from-user").last().addClass('latest');

      Api.removeFromDialogStack();
      Api.fixContextAfterGoingBack();
      editFile();
      checkNumberOfChatColumns();
    });

    $('#start_over').click(function() {
      Api.clearDialogStack();
      $('#scrollingChat').empty();
      deleteFile();
      ConversationPanel.re_init();

    });
});
