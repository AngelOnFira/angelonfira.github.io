// set each meter bar's width to its `data-width` attribute
$(function() {
  let meters = $('.meter .bar');
  meters.each(function(_, meter) {
    meter.style.width = meter.getAttribute('data-width');
  });
});
