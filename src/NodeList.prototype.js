var
  emtyArray = [],
  NodeListPrototype = (
    window.NodeList || document.querySelectorAll("_").constructor
  ).prototype;

function repeatForEach(method) {
  function invoke(el) {
    method.apply(el, this);
  }
  return function () {
    this.forEach(invoke, arguments);
  };
};

NodeListPrototype.every = emtyArray.every;
NodeListPrototype.filter = emtyArray.filter;
NodeListPrototype.forEach = emtyArray.forEach;
NodeListPrototype.map = emtyArray.map;
NodeListPrototype.some = emtyArray.some;

NodeListPrototype.on = repeatForEach(HTMLElementPrototype.on);
NodeListPrototype.off = repeatForEach(HTMLElementPrototype.off);
NodeListPrototype.css = repeatForEach(HTMLElementPrototype.css);
NodeListPrototype.handleEvent = repeatForEach(HTMLElementPrototype.handleEvent);

function supportsThemAll(el) {
  return el.supports.apply(el, this);
}
NodeListPrototype.supports = function supports() {
  return this.every(supportsThemAll, arguments);
};
