var
  buttons = $("button"),
  div = $("div"),
  button0 = buttons[0],
  button1 = buttons[1];

// common for all buttons
buttons
  .on("mouseover, mouseout", function (e) {
    this.css("font-weight", e.type === "mouseover" ? "bold" : 'normal');
  })
  .on("click", function () {
    this.dispatchEvent(new CustomEvent('mouseout'));
  });

// single extra concern
button0.on("click", function () {
  this.disabled = true;
  div.css({display: "block"});
});

// action on another element
button0.on(button1, "click", function (e) {
  this.disabled = false;
});

// button 1 realted matter
button1.on("click", function () {
  div.css("display", "none");
  var other = document.body.createElement('p');
  other.innerHTML = 'test';
  other
    .css({
      transition: 'all 1s ease-out'
    })
    .reflow()
    .css('transform', 'translateX(100px)')
    .on('transitionEnd', function transitionEnd() {
      alert('ok');
      this.on('click', function click() {
        this
          .off('transitionEnd', transitionEnd)
          .off('click', click);
        this.remove();
      });
    })
  ;
});