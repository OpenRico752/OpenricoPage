// Paleta de colores 

var colores = [
  "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db",
  "#9b59b6", "#e84393", "#fd79a8", "#00cec9", "#6c5ce7", "#a29bfe",
  "#2d3436", "#636e72", "#b2bec3", "#dfe6e9", "#ffffff", "#000000"
];
 
var panel = document.getElementById("panel");
var mini = document.getElementById("mini");
var paleta = document.getElementById("paleta");
var resultado = document.getElementById("resultado");
var codigo = document.getElementById("codigo");
var selector = document.getElementById("selector");
var btnCopiar = document.getElementById("copiar");
var btnMinimizar = document.getElementById("minimizar");
 
var TEXTO_COPIAR = "Copiar código HEX";
 
// Aquí queda guardado el último color elegido (avatar.js lo usa)
var colorElegido = null;
 
function textoLegible(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000" : "#fff";
}
 
function seleccionar(hex) {
  colorElegido = hex;
  resultado.style.background = hex;
  resultado.style.color = textoLegible(hex);
  codigo.textContent = hex.toUpperCase();
  selector.value = hex;
  btnCopiar.disabled = false;
  btnCopiar.textContent = TEXTO_COPIAR;
  Array.prototype.forEach.call(document.querySelectorAll(".color"), function (c) {
    c.classList.toggle("activo", c.dataset.color === hex);
  });
}
 
function minimizar() {
  panel.classList.add("oculto");
  mini.classList.add("visible");
  // El botón flotante toma el color elegido
  if (colorElegido) mini.style.background = colorElegido;
}
 
function abrir() {
  panel.classList.remove("oculto");
  mini.classList.remove("visible");
}
 
// Copiar al portapapeles, con respaldo para navegadores que lo bloquean
function copiarTexto(texto) {
  return new Promise(function (resolver) {
    function respaldo() {
      try {
        var t = document.createElement("textarea");
        t.value = texto;
        t.setAttribute("readonly", "");
        t.style.position = "fixed";
        t.style.top = "-1000px";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        t.setSelectionRange(0, texto.length);
        var ok = document.execCommand("copy");
        document.body.removeChild(t);
        resolver(ok);
      } catch (e) {
        resolver(false);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { resolver(true); }, respaldo);
    } else {
      respaldo();
    }
  });
}
 
// Crear los círculos de color
colores.forEach(function (hex) {
  var b = document.createElement("div");
  b.className = "color";
  b.style.background = hex;
  b.dataset.color = hex;
  b.tabIndex = 0;
  b.title = hex.toUpperCase();
  b.addEventListener("click", function () { seleccionar(hex); });
  b.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); seleccionar(hex); }
  });
  paleta.appendChild(b);
});
 
// Selector de color personalizado
selector.addEventListener("input", function (e) { seleccionar(e.target.value); });
 
// Copiar el código HEX y minimizar la paleta
btnCopiar.addEventListener("click", function () {
  if (!colorElegido) return;
  var hex = colorElegido.toUpperCase();
  copiarTexto(hex).then(function (ok) {
    btnCopiar.textContent = ok ? "¡Copiado!" : "Código: " + hex;
    setTimeout(function () {
      btnCopiar.textContent = TEXTO_COPIAR;
      minimizar();
    }, 600);
  });
});
 
btnMinimizar.addEventListener("click", minimizar);
mini.addEventListener("click", abrir);