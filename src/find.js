document.query = ElementPrototype.query = function find(css) {
  return this.querySelectorAll(css);
};
window.$ = function $(css, parent) {
  return (parent || document).query(css);
};
