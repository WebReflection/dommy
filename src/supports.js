window.supports =
document.supports =
ElementPrototype.supports = function supports(what, type, define) {
  var
    style = this.style,
    css = style && experimental(style, what, "css"),
    js = experimental(this, what, define || "js");
  switch(type) {
    case "css":
      return css;
    case "js":
      return js;
  }
  return !!(css || js);
};
