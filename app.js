const canvas = document.getElementById("canvas");

let selected = null;

/* ADD ELEMENTS */
function addBox() {
  const el = document.createElement("div");
  el.className = "obj";
  el.style.width = "100px";
  el.style.height = "100px";
  el.style.background = "#78cfc2";
  el.style.left = "50px";
  el.style.top = "50px";
  canvas.appendChild(el);
}

function addText() {
  const el = document.createElement("div");
  el.className = "obj";
  el.contentEditable = true;
  el.innerText = "Text";
  el.style.left = "50px";
  el.style.top = "50px";
  canvas.appendChild(el);
}

/* IMAGE UPLOAD */
document.getElementById("imgUpload").addEventListener("change", function(e){
  const file = e.target.files[0];
  const url = URL.createObjectURL(file);

  const img = document.createElement("img");
  img.src = url;
  img.className = "obj";
  img.style.width = "120px";
  img.style.left = "50px";
  img.style.top = "50px";

  canvas.appendChild(img);
});

/* SELECT */
canvas.addEventListener("click", (e) => {
  if (!e.target.classList.contains("obj")) return;

  selected = e.target;

  document.getElementById("posX").value = parseInt(selected.style.left);
  document.getElementById("posY").value = parseInt(selected.style.top);
  document.getElementById("width").value = parseInt(selected.style.width) || 100;
  document.getElementById("height").value = parseInt(selected.style.height) || 50;
});

/* DRAG */
let drag = false, offsetX, offsetY;

canvas.addEventListener("mousedown", (e) => {
  if (!e.target.classList.contains("obj")) return;

  drag = true;
  selected = e.target;

  offsetX = e.offsetX;
  offsetY = e.offsetY;
});

document.addEventListener("mousemove", (e) => {
  if (!drag || !selected) return;

  selected.style.left = (e.pageX - offsetX) + "px";
  selected.style.top = (e.pageY - offsetY) + "px";
});

document.addEventListener("mouseup", () => drag = false);

/* PROPERTIES */
document.getElementById("posX").oninput = (e) => selected.style.left = e.target.value + "px";
document.getElementById("posY").oninput = (e) => selected.style.top = e.target.value + "px";
document.getElementById("width").oninput = (e) => selected.style.width = e.target.value + "px";
document.getElementById("height").oninput = (e) => selected.style.height = e.target.value + "px";
document.getElementById("color").oninput = (e) => selected.style.background = e.target.value;

/* DELETE */
function deleteEl() {
  if (selected) selected.remove();
}

/* EXPORT */
function exportHTML() {
  const content = canvas.innerHTML;
  const blob = new Blob([content], {type: "text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design.html";
  a.click();
}
