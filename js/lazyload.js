[].forEach.call(document.querySelectorAll('img[data-lazysrc]'), function(img) {
    var downloadingImage = new Image();
    var dataSRC = img.getAttribute('data-lazysrc')
    downloadingImage.onload = function() {
    	img.setAttribute('src', dataSRC);
    	img.removeAttribute('data-lazysrc');
    };
    downloadingImage.src = dataSRC;
});
[].forEach.call(document.querySelectorAll('img[data-lazyadsrc]'), function(img) {
    var downloadingImage = new Image();
    var dataSRC = img.getAttribute('data-lazyadsrc');
    downloadingImage.onload = function() {
    	img.setAttribute('src', dataSRC);
    	img.removeAttribute('data-lazyadsrc');
    };
    downloadingImage.src = dataSRC;
});