var
  ws = new WeakShim,
  HTMLElementPrototype = (
    window.HTMLElement || window.Element
  ).prototype;

function notify(self, h, e) {
  h.handleEvent ? h.handleEvent(e) : h.call(self, e);
}

HTMLElementPrototype.handleEvent = function handleEvent(e) {
  var dh = ws.get(this),
      handlers = dh && dh[e.type],
      i, h;
  if (handlers) {
    i = handlers.target.indexOf(e.currentTarget);
    if (-1 < i) {
      for (h = handlers.handler[i], i = 0; i < h.length; notify(this, h[i++], e)){}
    }
  }
};

HTMLElementPrototype.on = function on(target, type, handler, capture) {
  if (typeof target === "string") {
    this.addEventListener(target, type, !!handler);
  } else {
    var dh = ws.get(this);
    if (!dh) {
      ws.set(this, dh = new DOMHandler);
    }
    dh.on(type, target, handler);
    target.addEventListener(type, this, !!capture);
  }
  return this;
};

HTMLElementPrototype.off = function on(target, type, handler, capture) {
  if (typeof target === "string") {
    this.removeEventListener(target, type, !!handler);
  } else {
    var dh = ws.get(this);
    if (dh && dh.off(type, target, handler)) {
      target.removeEventListener(type, this, !!capture);
      if (!Object.keys(dh).length) {
        ws['delete'](this);
      }
    }
  }
  return this;
};

HTMLElementPrototype.css = function css(key, value) {
  var
    self = this,
    style = self.style,
    css = experimental(style, key, "css");
  if (value !== undefined) {
    if (css) {
      style.cssText += ';' + css + '=' + value;
    }
    return self;
  }
  return css && getComputedStyle(self, null).getPropertyValue(css);
};

