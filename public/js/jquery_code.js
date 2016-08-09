$(document).ready(function() {
    //var previous_menu_clicks = 0;
    //for making the header fixed on scroll
    var $header = $("#header"),
        $clone = $header.before($header.clone().addClass("clone"));

    $(window).on("scroll", function() {
        var fromTop = $(window).scrollTop();
        $("body").toggleClass("down", (fromTop > 50));
    });


    $('#previous_menu').click(function() {
      //alert("hello");
      $(".from-watson .latest").removeClass('latest');
      $(".from-user .latest").removeClass('latest');
      //removing both the latest input field and the latest watson response
      $("#scrollingChat").children().last().remove();
      $("#scrollingChat").children().last().remove();
      $(".from-watson").last().addClass('latest');
      $(".from-user").last().addClass('latest');

      $(".from-watson .latest").removeClass('latest');
      $(".from-user .latest").removeClass('latest');
      //removing both the latest input field and the latest watson response
      $("#scrollingChat").children().last().remove();
      var latest_user_response = $("#scrollingChat").children().last();
      $("#scrollingChat").children().last().remove();
      $(".from-watson").last().addClass('latest');
      $(".from-user").last().addClass('latest');

      Api.removeFromDialogStack();
      var payload = Api.getRequestPayload();
      var context = Api.fixContextAfterGoingBack(payload);
      Api.sendRequest(latest_user_response.text(), context)

    });

    $('#start_over').click(function() {
      $('#scrollingChat').empty();
      deleteFile();
      ConversationPanel.re_init();

    });
});
