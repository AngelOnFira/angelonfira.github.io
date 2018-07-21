// DOM Properties
var bodyEle = getBodyTopEle();

// Window variables
var clientWidth, clientHeight;

// Scroll variables
var prevScroll, scrollTop, scrollBottom;

// Project variables
var projectLists = {};
var projectWorks = {};
var currProject = "softwareList";

// Debounce functions
var debounceRender;

function startMain() {
    initElements();

    function onBlur() {
        // document.body.className = 'blurred';
        document.body.classList.toggle('focused', false);
        document.body.classList.toggle('blurred', true);
    };

    function onFocus() {
        // document.body.className = 'focused';
        document.body.classList.toggle('blurred', false);
        document.body.classList.toggle('focused', true);
    };

    if ( /*@cc_on!@*/ false) { // check for Internet Explorer
        document.onfocusin = onFocus;
        document.onfocusout = onBlur;
    } else {
        window.onfocus = onFocus;
        window.onblur = onBlur;
    }

    // Handle resize
    var handleResize = debounce(function() {
        resize();
    }, 2);
    window.onresize = handleResize;
    resize();


    debounceRender = debounce(function() {
        renderCanvas();
    }, 250);


    // Handle scroll
    var handleScroll = debounce(function() {
        handleWindowScroll();
    }, 10);
    window.onscroll = handleScroll;
    handleWindowScroll();

    initListeners();
}

function initElements(){
    projectLists["softwareList"] = document.getElementById("softwareList");
    projectLists["gamedevList"] = document.getElementById("gamedevList");

    projectWorks["softwareList"] = projectLists["softwareList"].getElementsByClassName('work');
    projectWorks["gamedevList"] = projectLists["gamedevList"].getElementsByClassName('work');
}

function initListeners(){
    var parent, len;

    parent = document.getElementsByClassName('navOption');
    for(var i = 0; i < parent.length; i++){
        parent[i].addEventListener('click', function(){
            console.log("CLICKED");
            var elmnt = document.getElementById(this.dataset.name + "Container");
            scrollTo(bodyEle, elmnt.offsetTop, 600);
        });
    }

    parent = document.getElementsByClassName('jobContent');
    for(var i = 0; i < parent.length; i++){
        parent[i].addEventListener('click', function(){
            var p = this.parentNode;
            if(p.classList.contains('click'))
                p.classList.toggle('click', false);
            else {
                parent = document.getElementsByClassName('job');
                for(var b = 0; b < parent.length; b++){
                    parent[b].classList.toggle('click', false);
                }
                p.classList.toggle('click');
            }
        });
    }

    parent = document.getElementsByClassName('work');
    for(var i = 0; i < parent.length; i++){
        parent[i].addEventListener('mouseenter', function(){
            var p = projectWorks[currProject];
            for(var a = 0; a < p.length; a++){
                p[a].classList.toggle('INVIEW', false);
            }
            this.classList.toggle('INVIEW', true);
        });
    }

    parent = document.getElementById('workToggles');
    parent = parent.getElementsByClassName('workToggle');
    for(var i = 0; i < parent.length; i++){
        parent[i].addEventListener('click', function(){
            var p = document.getElementsByClassName('workToggle');
            for(var a = 0; a < p.length; a++){
                p[a].classList.toggle('click', false);
            }
            currProject = this.dataset.name + "List";
            document.getElementById('workContainer').className = currProject;
            this.classList.toggle('click', true);
        });
    }
}
function handleWindowScroll(force){
    scrollTop = bodyEle.scrollTop;
    if (force || prevScroll != scrollTop) {
        prevScroll = scrollTop;
        scrollBottom = scrollTop + clientHeight;

        var parent, len;
        parent = projectWorks[currProject];
        len = parent.length - 1;
        var toggled = false;
        for(; len >= 0; len--){
            if(toggled)
                parent[len].classList.toggle('INVIEW', false);
            else if(scrollBottom > parent[len].offsetTop + parent[len].clientHeight + 60){
                parent[len].classList.toggle('INVIEW', true);
                toggled = true;
            } else
                parent[len].classList.toggle('INVIEW', false);
        }
    }
}
function resize(){
    // Set the content panel to the remaining window width
    var newWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var newHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    // Only re-render voronoi on width change
    if(newWidth != clientWidth){
        clientWidth = newWidth;
        try {
            debounceRender();
        } catch(err) {
            // Handle error(s) here
        }
    }


    clientHeight = newHeight;
}


/* 

    STAPLE FUNCTIONS

*/
function scrollTo(element, to, duration) {
    var rem = to - element.scrollTop;

    var scrollTime = Math.abs(rem) / 3;
    if (scrollTime > duration)
        scrollTime = duration;

    // if (Math.abs(rem / duration) < 1)
    // duration = Math.abs(rem);

    scrollToEle(element, to, scrollTime);
}

var scrollInt = 5;
function scrollToEle(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * scrollInt;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollToEle(element, to, duration - scrollInt);
    }, scrollInt);
}

function isArray(obj) {
    return isObject(obj) && (obj instanceof Array);
}

// All arrays are objects but not all objects are arrays
function isObject(obj) {
    return obj && (typeof obj === "object");
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
window.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


function getBodyTopEle() { var el = document.scrollingElement || document.documentElement; return el; }