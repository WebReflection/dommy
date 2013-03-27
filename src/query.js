function $(css, parent) {
  return (parent || document).query(css);
}
$.create = function create(nodeName) {
  return document.createElement(nodeName);
};
$.text = function text(content) {
  return document.createTextNode(content);
};
window.$ = window.query = $;
document.query = ElementPrototype.query = function find(css) {
  return this.querySelectorAll(css);
};