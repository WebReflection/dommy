var
  emtyArray = [],
  NodeListPrototype = (
    window.NodeList || document.querySelectorAll("_").constructor
  ).prototype;

function createInvoker(method) {
  return function invoke(el) {
    method.apply(el, this);
  };
}

NodeListPrototype.every = emtyArray.every;
NodeListPrototype.filter = emtyArray.filter;
NodeListPrototype.forEach = emtyArray.forEach;
NodeListPrototype.map = emtyArray.map;
NodeListPrototype.some = emtyArray.some;

var forEachONOFF = function (method) {
  var invoke = createInvoker(method);
  return function () {
    this.forEach(invoke, arguments);
    return this;
  };
};
NodeListPrototype.on = forEachONOFF(ElementPrototype.on);
NodeListPrototype.off = forEachONOFF(ElementPrototype.off);

var forEachCSS = createInvoker(ElementPrototype.css),
    forEachDispatch = createInvoker(ElementPrototype.dispatchEvent);
NodeListPrototype.css = function css(key, value) {
  if (this.length) {
    if (value !== undefined)
      return this.forEach(forEachCSS, arguments) || this;
    return this[0].css(key);
  }
};
NodeListPrototype.fire = function fire(type, detail) {
  this.forEach(forEachDispatch, [new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: detail
  })]);
};

NodeListPrototype.reflow = document.reflow;

function supportsThemAll(el) {
  return el.supports(this);
}
NodeListPrototype.supports = function supports(what) {
  return this.every(supportsThemAll, what);
};
