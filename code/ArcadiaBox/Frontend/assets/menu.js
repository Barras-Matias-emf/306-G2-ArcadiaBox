const btns = [...document.querySelectorAll(".btn")];
let index = 0;

function setActive(i) {
  btns.forEach((b) => b.classList.remove("active"));
  index = (i + btns.length) % btns.length;
  btns[index].classList.add("active");
  btns[index].focus({ preventScroll: true });
}

window.addEventListener("load", () => setActive(0));

window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();

  if (k === "a" || e.key === "ArrowLeft") {
    e.preventDefault();
    setActive(index - 1);
  }

  if (k === "d" || e.key === "ArrowRight") {
    e.preventDefault();
    setActive(index + 1);
  }

  if (e.key === "Enter") {
    e.preventDefault();
    btns[index].click();
  }
});

btns.forEach((b, i) => {
  b.addEventListener("mouseenter", () => setActive(i));
  b.addEventListener("focus", () => setActive(i));
});
