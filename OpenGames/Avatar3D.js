// ponle nombre al avatar y míralo en 3D
(function () {
  var PROF = 9;   // cantidad de capas de profundidad
  var PASO = 3;   // separación entre capas (px)
  var NOMBRES = ["Bolt", "Chip", "Zeta", "Nova", "Orbit", "Pixel", "Turbo", "Byte", "Volt", "Atlas", "Cobalto", "Robi"];

  // ---------- Utilidades de color ----------
  function hexARgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbAHex(rgb) {
    return "#" + rgb.map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    }).join("");
  }
  function mezclar(hex, destino, t) {
    var a = hexARgb(hex), b = hexARgb(destino);
    return rgbAHex(a.map(function (v, i) { return v + (b[i] - v) * t; }));
  }
  function luminosidad(hex) {
    var c = hexARgb(hex);
    return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000;
  }

  // ---------- Estilos ----------
  function inyectarEstilos() {
    if (document.getElementById("a3d-estilos")) return;
    var css = [
      ".av-insignia { display: none !important; }",
      ".a3d-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 3000; font-family: system-ui, sans-serif; }",
      ".a3d-card { background: #fff; border-radius: 20px; padding: 22px; width: min(94vw, 400px); max-height: 94vh; overflow-y: auto; box-shadow: 0 14px 44px rgba(0,0,0,.4); text-align: center; }",
      ".a3d-titulo { font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }",
      ".a3d-ayuda { font-size: .8rem; color: #777; margin-bottom: 8px; }",
      ".a3d-escena { position: relative; margin: 0 auto; perspective: 700px; touch-action: none; cursor: grab; user-select: none; -webkit-user-select: none; }",
      ".a3d-escena:active { cursor: grabbing; }",
      ".a3d-obj { position: absolute; inset: 0; transform-style: preserve-3d; will-change: transform; }",
      ".a3d-capa { position: absolute; left: 0; top: 0; width: 100%; backface-visibility: visible; pointer-events: none; }",
      ".a3d-capa svg { width: 100%; height: 100%; display: block; }",
      ".a3d-sombra { position: absolute; left: 14%; right: 14%; bottom: 20px; height: 16px; border-radius: 50%; background: radial-gradient(ellipse at center, rgba(0,0,0,.35), rgba(0,0,0,0) 70%); pointer-events: none; }",
      ".a3d-placa { position: absolute; left: -10%; right: -10%; bottom: 0; text-align: center; font-weight: 800; letter-spacing: .04em; pointer-events: none; white-space: nowrap; transform: translateZ(42px); }",
      ".a3d-fila { display: flex; gap: 8px; margin-top: 16px; }",
      ".a3d-input { flex: 1; padding: 11px 12px; border: 2px solid #ddd; border-radius: 10px; font-size: 1rem; outline: none; text-align: center; }",
      ".a3d-input:focus { border-color: #222; }",
      ".a3d-btn { padding: 11px 14px; border: none; border-radius: 10px; font-size: .95rem; cursor: pointer; background: #e5e7ee; }",
      ".a3d-btn.prim { background: #222; color: #fff; flex: 1; }",
      ".a3d-tarjeta { position: fixed; top: 16px; right: 16px; padding: 6px 10px 4px; background: rgba(255,255,255,.92); border-radius: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.25); cursor: pointer; z-index: 1600; }"
    ].join("\n");
    var s = document.createElement("style");
    s.id = "a3d-estilos";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Escena 3D ----------
  // Apila copias del SVG a distintas profundidades para dar volumen
  // y las gira con el mouse o el dedo.
  function crearEscena3D(svgHtml, color, nombre, tam) {
    var alto = Math.round(tam * 1.12);
    var escena = document.createElement("div");
    escena.className = "a3d-escena";
    escena.style.width = tam + "px";
    escena.style.height = (alto + 34) + "px";

    var obj = document.createElement("div");
    obj.className = "a3d-obj";

    var capas = "";
    for (var i = PROF; i >= 1; i--) {
      var brillo = 0.45 + (PROF - i) * 0.03;
      capas += '<div class="a3d-capa" style="height:' + alto + 'px;transform:translateZ(' + (-i * PASO) +
               'px);filter:brightness(' + brillo.toFixed(2) + ')">' + svgHtml + '</div>';
    }
    capas += '<div class="a3d-capa" style="height:' + alto + 'px;transform:translateZ(' + PASO + 'px)">' + svgHtml + '</div>';
    obj.innerHTML = capas;

    var sombra = document.createElement("div");
    sombra.className = "a3d-sombra";
    sombra.style.bottom = "26px";

    var placa = document.createElement("div");
    placa.className = "a3d-placa";
    var tinta = luminosidad(color) > 190 ? mezclar(color, "#000000", 0.35) : color;
    var d1 = mezclar(tinta, "#000000", 0.25);
    var d2 = mezclar(tinta, "#000000", 0.4);
    var d3 = mezclar(tinta, "#000000", 0.55);
    placa.style.color = tinta;
    placa.style.fontSize = Math.max(14, Math.round(tam * 0.13)) + "px";
    placa.style.textShadow =
      "0 1px 0 " + d1 + ", 0 2px 0 " + d1 + ", 0 3px 0 " + d2 + ", 0 4px 0 " + d2 +
      ", 0 5px 0 " + d3 + ", 0 6px 0 " + d3 + ", 0 10px 12px rgba(0,0,0,.35)";
    placa.textContent = nombre || "";

    obj.appendChild(placa);
    escena.appendChild(sombra);
    escena.appendChild(obj);

    // ----- Interacción y animación -----
    var cur = { rx: 0, ry: 0 };
    var hover = null;
    var arrastrando = false;
    var drag = { rx: -6, ry: 0, x: 0, y: 0 };

    escena.addEventListener("pointerenter", function () { hover = { rx: 0, ry: 0 }; });
    escena.addEventListener("pointerleave", function () { if (!arrastrando) hover = null; });
    escena.addEventListener("pointermove", function (e) {
      var r = escena.getBoundingClientRect();
      if (arrastrando) {
        drag.ry += (e.clientX - drag.x) * 0.7;
        drag.rx -= (e.clientY - drag.y) * 0.5;
        drag.rx = Math.max(-40, Math.min(40, drag.rx));
        drag.x = e.clientX;
        drag.y = e.clientY;
      } else {
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        hover = { rx: -py * 30, ry: px * 50 };
      }
    });
    escena.addEventListener("pointerdown", function (e) {
      arrastrando = true;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.ry = cur.ry;
      drag.rx = cur.rx;
      try { escena.setPointerCapture(e.pointerId); } catch (err) {}
    });
    function soltar() { arrastrando = false; }
    escena.addEventListener("pointerup", soltar);
    escena.addEventListener("pointercancel", soltar);

    function animar(t) {
      if (!document.body.contains(escena)) return;
      var meta;
      if (arrastrando) {
        meta = drag;
      } else if (hover) {
        meta = hover;
      } else {
        meta = { rx: -6 + Math.sin(t / 900) * 3, ry: Math.sin(t / 1400) * 25 };
      }
      cur.rx += (meta.rx - cur.rx) * 0.12;
      cur.ry += (meta.ry - cur.ry) * 0.12;
      var flota = Math.sin(t / 600) * 5;
      obj.style.transform = "translateY(" + flota.toFixed(2) + "px) rotateX(" + cur.rx.toFixed(2) + "deg) rotateY(" + cur.ry.toFixed(2) + "deg)";
      var esc = 1 - flota / 60;
      sombra.style.transform = "scale(" + esc.toFixed(3) + ")";
      sombra.style.opacity = (0.9 - flota / 25).toFixed(2);
      requestAnimationFrame(animar);
    }
    requestAnimationFrame(animar);

    return {
      el: escena,
      setNombre: function (n) { placa.textContent = n || ""; }
    };
  }

  // ---------- Editor de nombre ----------
  function nombreAlAzar() {
    var n = NOMBRES[Math.floor(Math.random() * NOMBRES.length)];
    return n + "-" + Math.floor(Math.random() * 90 + 10);
  }

  function obtenerSvg() {
    var ins = document.querySelector(".av-insignia");
    return ins ? ins.innerHTML : "";
  }

  function abrirEditorNombre(avatar) {
    inyectarEstilos();
    var previo = document.querySelector(".a3d-overlay");
    if (previo) previo.remove();

    var svg = obtenerSvg();
    var nombreInicial = avatar.nombre || "";

    var overlay = document.createElement("div");
    overlay.className = "a3d-overlay";
    overlay.innerHTML =
      '<div class="a3d-card">' +
        '<div class="a3d-titulo">Dale nombre a tu robot</div>' +
        '<div class="a3d-ayuda">Arrástralo para girarlo en 3D</div>' +
        '<div class="a3d-sitio"></div>' +
        '<div class="a3d-fila">' +
          '<input class="a3d-input" maxlength="14" placeholder="Escribe su nombre" />' +
          '<button class="a3d-btn" data-acc="azar" title="Nombre al azar">🎲</button>' +
        '</div>' +
        '<div class="a3d-fila">' +
          '<button class="a3d-btn" data-acc="cambiar">Cambiar avatar</button>' +
          '<button class="a3d-btn prim" data-acc="guardar">Guardar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var escena = crearEscena3D(svg, avatar.color, nombreInicial, 210);
    overlay.querySelector(".a3d-sitio").appendChild(escena.el);

    var input = overlay.querySelector(".a3d-input");
    input.value = nombreInicial;
    input.addEventListener("input", function () { escena.setNombre(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") guardar();
    });
    setTimeout(function () { input.focus(); }, 50);

    overlay.querySelector('[data-acc="azar"]').addEventListener("click", function () {
      input.value = nombreAlAzar();
      escena.setNombre(input.value);
    });

    overlay.querySelector('[data-acc="cambiar"]').addEventListener("click", function () {
      overlay.remove();
      if (window.abrirSelectorAvatar) window.abrirSelectorAvatar(avatar.color);
    });

    function guardar() {
      var nombre = input.value.trim() || "Robot";
      window.avatarElegido = Object.assign({}, window.avatarElegido || avatar, { nombre: nombre });
      overlay.remove();
      mostrarTarjeta(window.avatarElegido);
      document.dispatchEvent(new CustomEvent("avatar-listo", { detail: window.avatarElegido }));
    }
    overlay.querySelector('[data-acc="guardar"]').addEventListener("click", guardar);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ---------- Tarjeta 3D fija en la esquina ----------
  function mostrarTarjeta(avatar) {
    inyectarEstilos();
    var vieja = document.querySelector(".a3d-tarjeta");
    if (vieja) vieja.remove();

    var tarjeta = document.createElement("div");
    tarjeta.className = "a3d-tarjeta";
    tarjeta.title = "Editar nombre o avatar";
    var escena = crearEscena3D(obtenerSvg(), avatar.color, avatar.nombre, 96);
    tarjeta.appendChild(escena.el);
    tarjeta.addEventListener("click", function () {
      abrirEditorNombre(window.avatarElegido);
    });
    document.body.appendChild(tarjeta);
  }

  // ---------- Conexión con avatar.js ----------
  document.addEventListener("avatar-elegido", function (e) {
    var anterior = window.avatarElegido && window.avatarElegido.nombre;
    var datos = Object.assign({}, e.detail);
    if (anterior) datos.nombre = anterior;
    window.avatarElegido = datos;
    abrirEditorNombre(datos);
  });

  window.abrirEditorNombre = abrirEditorNombre;
  window.crearEscena3D = crearEscena3D;

  // ---------- Aquí continúas tu código ----------
  document.addEventListener("avatar-listo", function (e) {
    console.log("Avatar listo:", e.detail);
    // e.detail = { color, cabeza, ojos, boca, antena, cuerpo, nombre }
  });
})();
