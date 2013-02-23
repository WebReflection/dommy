var
  emtyArray = [],
  NodeListPrototype = (
    window.NodeList || document.querySelectorAll("_").constructor
  ).prototype;

function createInvoker(method) {
  return function invoke(el) {
    method.apply(el, this);
  }
};

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
NodeListPrototype.on = forEachONOFF(HTMLElementPrototype.on);
NodeListPrototype.off = forEachONOFF(HTMLElementPrototype.off);

var forEachCSS = createInvoker(HTMLElementPrototype.css);
NodeListPrototype.css = function css(key, value) {
  if (this.length) {
    if (value !== undefined)
      return this.forEach(forEachCSS, arguments) || this;
    return this[0].css(key);
  }
};

function supportsThemAll(el) {
  return el.supports(this);
}
NodeListPrototype.supports = function supports(what) {
  return this.every(supportsThemAll, what);
};
