const products = document.querySelector(".products");

let isDown = false;
let startX;
let scrollLeft;

products.addEventListener("mousedown", (e) => {
  isDown = true;
  products.classList.add("active");
  startX = e.pageX - products.offsetLeft;
  scrollLeft = products.scrollLeft;
});

products.addEventListener("mouseleave", () => {
  isDown = false;
  products.classList.remove("active");
});

products.addEventListener("mouseup", () => {
  isDown = false;
  products.classList.remove("active");
});

products.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();

  const x = e.pageX - products.offsetLeft;
  const walk = (x - startX) * 1.8;
  products.scrollLeft = scrollLeft - walk;
});