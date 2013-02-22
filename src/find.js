document.find = HTMLElementPrototype.find = function (css) {
  return this.querySelectorAll(css);
};