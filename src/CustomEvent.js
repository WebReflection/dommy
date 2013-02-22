window.CustomEvent || (window.CustomEvent = function(){
  function initCustomEvent(
    type, bubbles, cancelable, detail
  ) {
    CustomEvent.call(this, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: detail
    });
  }
  return function CustomEvent(type, eventInitDict) {
    var evt = window.document.createEvent("Event");
    if (eventInitDict) {
      evt.initEvent(type, !!eventInitDict.bubbles, !!eventInitDict.cancelable);
      evt.detail = eventInitDict.detail || null;
    } else {
      evt.initCustomEvent = initCustomEvent;
    }
    return evt;
  };
}());
