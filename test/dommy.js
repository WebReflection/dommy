//remove:

//:remove

document.body.appendChild(
  document.createElement('div')
).innerHTML = '<ul><li>a</li><li>b</li><li>c</li></ul><input type="checkbox">';


wru.test([
  {
    name: "prototype polluted",
    test: function () {
      wru.assert(typeof document.body.on == "function");
    }
  }, {
    name: "offline reaction",
    test: function () {
      var
        div = document.createElement("div"),
        p = document.createElement("p"),
        cb;
      p.on(div, "click", cb = wru.async(function (e) {
        p.off(div, e.type, cb);
        wru.assert("notified");
      }));
      div.dispatchEvent(new CustomEvent("click"));
    }
  }, {
    name: "find",
    test: function () {
      wru.assert(document.find("li").length);
      document.find("li").forEach(function (li, i) {
        li.textContent = i + 1;
      });
      document.find("input").on("change", function () {
        alert(this);
      });
    }
  }
]);
