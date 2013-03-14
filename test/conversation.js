!function(){
  // this is a prototype, don't ever even think to put this in production ^_^;;
  function $(css, parent) {
    return (parent || document).querySelectorAll(css);
  }
  function rand(min, max){
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  }
  $('head')[0].appendChild(document.createElement('style')).textContent = '.conversation {\
    font-size: 12px;\
    color: #333;\
    line-height: 16px;\
    position: relative;\
    padding: 0px;\
    margin: 1em 0 3em;\
    border: 1px solid silver;\
    background: #fff;\
    -webkit-border-radius: 5px;\
       -moz-border-radius: 5px;\
        -ms-border-radius: 5px;\
         -o-border-radius: 5px;\
            border-radius: 5px;\
  }\
  \
  .conversation timestamp {\
    color: #999;\
  }\
  \
  .conversation:before,\
  .conversation:after {\
    content: "";\
    position: absolute;\
    border-style: solid;\
    display:block; \
    width:0;\
  }\
  \
  .conversation:before {\
    top: -7px;\
    left: 20px;\
    border-width: 0 7px 7px;\
    border-color: silver transparent;\
  }\
  \
  .conversation:after {\
    top: -6px;\
    left: 21px;\
    border-width: 0 6px 6px;\
    border-color:#fff transparent;\
  }\
  \
  .conversation img {\
    position: absolute;\
    margin-top: 2px;\
    left: 7px;\
    width: 24px;\
    height: 24px;\
    -webkit-border-radius: 5px;\
       -moz-border-radius: 5px;\
        -ms-border-radius: 5px;\
         -o-border-radius: 5px;\
            border-radius: 5px;\
  }\
  .conversation > div {\
    padding: 0;\
    position: relative;\
    min-height: 22px;\
    border-top: 1px solid silver;\
  }\
  .conversation > div:first-child {\
    border-top: none;\
  }\
  .conversation p {\
    padding-left: 37px;\
    padding-right: 7px;\
    margin-top: 5px;\
  }\
  .conversation .view-more img,\
  .conversation .view-more span,\
  .conversation .view-more timestamp {\
    display: none;\
  }\
  .conversation .view-more {\
    height: 16px;\
  }\
  .conversation .view-more:before {\
    content: "";\
    position: absolute;\
    display: block;\
    padding: 0;\
    margin: 0;\
    left: 12px;\
    top: 2px;\
    width: 16px;\
    height: 16px;\
    background-image: url(https://ma.twimg.com/twitter-mobile/2cce9394192a8b57944b0f868b3a80d34c883212/html5/applications/m5/assets/sprite_mobile.png);\
    background-repeat: no-repeat;\
    background-size: 280px 236px;\
    background-position: -27px -117px;\
    /* background-position: -156px -449px; */\
  }\
  .conversation strong:after {\
    content: ":";\
  }\
  .conversation .view-more strong:after {\
    content: "";\
  }';
  function findNext(div, i) {
    var next;
    do {
      next = div[++i];
    } while(next && next.alreadyParsed);
    if (next) {
      next.alreadyParsed = true;
    }
    return next || '';
  }
  function getOneReply(tmp) {
    return tmp && '<div>\
      <img src="' + $('img.avatar', tmp.parentNode)[0].src + '" />\
      <p>\
        <strong>' + $('span.full-name', tmp)[0].textContent + '</strong>\
        <span>' + $('div.tweet-text', tmp)[0].textContent + '</span>\
        <timestamp>' + $('div.timestamp', tmp)[0].textContent + '</timestamp>\
      </p>\
    </div>';
  }
  function generateViewMore() {
    return '<div class="view-more">\
      <img />\
      <p>\
        <strong>View ' + rand(1, 50)+ ' more replies</strong>\
        <span></span>\
        <timestamp></timestamp>\
      </p>\
    </div>';
  }
  function addMore(div, i, parent) {
    var tmp = findNext(div, i), parentNode;
    if (tmp) {
      parentNode = tmp.parentNode;
      tmp.innerHTML = getOneReply(tmp);
      tmp.className = '';
      parent.appendChild(tmp);
      while (parentNode.nodeName !== "LI") {
        parentNode = parentNode.parentNode;
      }
      parentNode.parentNode.removeChild(parentNode);
    }
  }
  (function replace() {
    for (var tmp, next, div = $('div.tweet-content'), i = 0, r, j; i < div.length; i++) {
      if (!div[i].alreadyParsed) {
        div[i].alreadyParsed = true;
        switch(r = rand(0, 6)) {
          case 0: 
          case 1: break;
          default:
            tmp = document.createElement('div');
            tmp.className = 'conversation';
            if (3 < r) {
              tmp.innerHTML = generateViewMore();
            } else {
              addMore(div, i, tmp);
            }
            if (2 < r) {
              addMore(div, i, tmp);
              if (4 < r) {
                addMore(div, i, tmp);
                if (5 < r) {
                  addMore(div, i, tmp);
                }
              }
            }
            div[i].appendChild(tmp);
            break;
        }
      }
    }
    setTimeout(replace, 5000);
  }());
}();