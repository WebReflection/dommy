(function(ElementPrototype, property, defineProperty, i){
  function ClassList(node) {
    var cl = [];
    cl._ = node;
    cl.add = add;
    cl.contains = contains;
    cl.item = item;
    cl.remove = remove;
    cl.toggle = toggle;
    update(cl);
    return cl;
  }
  function update(self) {
    self.length = 0;
    self.push.apply(
      self, self._.className.replace(/^\s+|\s+$/g, '').split(/\s+/)
    );
  }
  function setClass(self) {
    self._.className = self.join(' ');
  }
  function add(className) {
    if (!this.contains(className)) {
      this.push(className);
      setClass(this);
    }
  }
  function contains(className) {
    update(this);
    i = this.indexOf(className);
    return -1 < i;
  }
  function item(i) {
    return this[i];
  }
  function remove(className) {
    if (this.contains(className)) {
      this.splice(i, 1);
      setClass(this);
    }
  }
  function toggle(className) {
    if (this.contains(className)) {
      this.splice(i, 1);
    } else {
      this.push(className);
    }
    setClass(this);
  }
  if (!(property in ElementPrototype))
    defineProperty(
      ElementPrototype,
      property,
      {
        get: function () {
          return defineProperty(this, property, {
            value: ClassList(this)
          })[property];
        }
      }
    );
}(ElementPrototype, 'classList', Object.defineProperty));