window.supports =
document.supports =
HTMLElementPrototype.supports = function supports(what, type) {
  var
    css = this.style && experimental(this.style, what, "css"),
    js = experimental(this, what, "js");
  switch(type) {
    case "css":
      return css;
    case "js":
      return js;
  }
  return !!(css || js);
};
