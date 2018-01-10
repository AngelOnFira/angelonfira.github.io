$(function() {
  $("#main-navbar a").on('click', function(event) {
    event.preventDefault();

    var element = (this.hash !=="") ? $(this.hash) : $('html,body') ;
    var offset = element.offset().top;

    $('html, body').animate({
      scrollTop: offset
    }, 800, function(){
      window.location.hash = "#" + (element.attr('id') || "");
    });
  });
});
