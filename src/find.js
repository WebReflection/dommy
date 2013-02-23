document.find = HTMLElementPrototype.find = function find(css) {
  return this.querySelectorAll(css);
};
window.$ = function $(css, parent) {
  return (parent || document).find(css);
};