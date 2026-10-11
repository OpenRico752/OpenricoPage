// creador de avatares (robot, humano, esqueleto y alien)
(function () {
  // ---------- Tipos y opciones ----------
  var TIPOS = {
    robot: {
      etiqueta: "Robot",
      cats: [
        { k: "cabeza", e: "Cabeza", v: ["cuadrada", "redonda", "alta", "hexagonal"] },
        { k: "ojos",   e: "Ojos",   v: ["redondos", "visor", "ciclope", "x", "felices"] },
        { k: "boca",   e: "Boca",   v: ["rejilla", "sonrisa", "linea", "o"] },
        { k: "extra",  e: "Antena", v: ["ninguna", "simple", "doble", "rayo"] },
        { k: "cuerpo", e: "Cuerpo", v: ["cuadrado", "redondo", "trapecio"] }
      ]
    },
    humano: {
      etiqueta: "Humano",
      cats: [
        { k: "cabeza",    e: "Piel",       v: ["clara", "media", "morena", "oscura"] },
        { k: "ojos",      e: "Ojos",       v: ["normales", "felices", "guino", "lentes", "cerrados"] },
        { k: "boca",      e: "Boca",       v: ["sonrisa", "seria", "abierta", "lengua"] },
        { k: "extra",     e: "Pelo",       v: ["corto", "largo", "rizado", "calvo", "gorra", "mohicano"] },
        { k: "pelocolor", e: "Color pelo", v: ["negro", "castano", "rubio", "pelirrojo", "gris", "azul"] },
        { k: "cuerpo",    e: "Ropa",       v: ["playera", "sudadera", "tirantes"] }
      ]
    },
    esqueleto: {
      etiqueta: "Esqueleto",
      cats: [
        { k: "cabeza", e: "Craneo",    v: ["redonda", "ovalada", "ancha"] },
        { k: "ojos",   e: "Ojos",      v: ["huecos", "enojados", "tristes", "x", "brillantes"] },
        { k: "boca",   e: "Boca",      v: ["dientes", "sonrisa", "linea", "o"] },
        { k: "extra",  e: "Accesorio", v: ["ninguno", "sombrero", "corona", "lazo", "parche"] },
        { k: "cuerpo", e: "Torso",     v: ["costillas", "playera", "sudadera"] }
      ]
    },
    alien: {
      etiqueta: "Alien",
      cats: [
        { k: "cabeza", e: "Cabeza",  v: ["ovalada", "grande", "triangular"] },
        { k: "ojos",   e: "Ojos",    v: ["grandes", "tres", "ciclope", "felices", "ranura"] },
        { k: "boca",   e: "Boca",    v: ["pequena", "sonrisa", "linea", "dientes"] },
        { k: "extra",  e: "Antenas", v: ["ninguna", "dos", "una", "orejas"] },
        { k: "cuerpo", e: "Cuerpo",  v: ["delgado", "redondo", "trapecio"] }
      ]
    }
  };

  var DEFAULTS = {
    robot:     { cabeza: "cuadrada", ojos: "redondos", boca: "rejilla",  extra: "simple",  cuerpo: "cuadrado" },
    humano:    { cabeza: "media",    ojos: "normales", boca: "sonrisa",  extra: "corto",   pelocolor: "castano", cuerpo: "playera" },
    esqueleto: { cabeza: "redonda",  ojos: "huecos",   boca: "dientes",  extra: "ninguno", cuerpo: "costillas" },
    alien:     { cabeza: "ovalada",  ojos: "grandes",  boca: "pequena",  extra: "dos",     cuerpo: "delgado" }
  };

  var PIELES = { clara: "#ffdbb4", media: "#e0ac69", morena: "#c68642", oscura: "#8d5524" };
  var PELOS = {
    negro: "#2b2118", castano: "#6b4423", rubio: "#e6c35c",
    pelirrojo: "#b5441e", gris: "#b8b8c0", azul: "#3b82f6"
  };

  function nuevoCfg(tipo) {
    return Object.assign({ tipo: tipo }, DEFAULTS[tipo]);
  }

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

  // ---------- Ayudantes para dibujar SVG ----------
  function at(fill, stroke, sw) {
    var s = ' fill="' + (fill || "none") + '"';
    if (stroke) {
      s += ' stroke="' + stroke + '" stroke-width="' + (sw || 3) +
           '" stroke-linejoin="round" stroke-linecap="round"';
    }
    return s;
  }
  function R(x, y, w, h, rx, fill, stroke, sw) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" rx="' + rx + '"' + at(fill, stroke, sw) + '/>';
  }
  function C(cx, cy, r, fill, stroke, sw) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + at(fill, stroke, sw) + '/>';
  }
  function E(cx, cy, rx, ry, fill, stroke, sw, rot) {
    var t = rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : "";
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + t +
           at(fill, stroke, sw) + '/>';
  }
  function L(x1, y1, x2, y2, stroke, sw) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' +
           at(null, stroke, sw) + '/>';
  }
  function P(d, fill, stroke, sw) {
    return '<path d="' + d + '"' + at(fill, stroke, sw) + '/>';
  }
  function PG(points, fill, stroke, sw) {
    return '<polygon points="' + points + '"' + at(fill, stroke, sw) + '/>';
  }

  // ---------- ROBOT ----------
  function cabezaDims(tipo) {
    switch (tipo) {
      case "redonda":   return { x: 48, y: 55, w: 104, h: 80, r: 40 };
      case "alta":      return { x: 60, y: 40, w: 80,  h: 95, r: 12 };
      case "hexagonal": return { x: 48, y: 55, w: 104, h: 80, r: 0 };
      default:          return { x: 50, y: 55, w: 100, h: 80, r: 14 };
    }
  }

  function dibujarRobot(cfg, color, borde) {
    var luz = "#7df9ff", acento = "#ffd166", pant = "#1b1f2a";
    var d = cabezaDims(cfg.cabeza);
    var cx = 100;
    var sx = d.x + 10, sy = d.y + 10, sw = d.w - 20, sh = d.h - 20;
    var ojoY = sy + sh * 0.38;
    var bocaY = sy + sh * 0.76;
    var dx = sw * 0.22;
    var o = "";

    // Antena
    if (cfg.extra === "simple") {
      o += L(100, d.y, 100, d.y - 18, borde, 4) + C(100, d.y - 22, 5, acento, borde, 3);
    } else if (cfg.extra === "doble") {
      o += L(80, d.y, 70, d.y - 18, borde, 4) + L(120, d.y, 130, d.y - 18, borde, 4) +
           C(70, d.y - 22, 5, acento, borde, 3) + C(130, d.y - 22, 5, acento, borde, 3);
    } else if (cfg.extra === "rayo") {
      var y = d.y;
      o += PG("104," + (y - 30) + " 92," + (y - 13) + " 100," + (y - 13) + " 96," + (y + 1) +
              " 110," + (y - 17) + " 102," + (y - 17), acento, borde, 2);
    }

    // Brazos
    o += R(38, 152, 14, 46, 7, color, borde, 4) + R(148, 152, 14, 46, 7, color, borde, 4);

    // Cuerpo
    if (cfg.cuerpo === "trapecio") {
      o += PG("70,145 130,145 146,212 54,212", color, borde, 4);
    } else if (cfg.cuerpo === "redondo") {
      o += R(60, 145, 80, 66, 32, color, borde, 4);
    } else {
      o += R(60, 145, 80, 66, 10, color, borde, 4);
    }

    // Cuello y orejas
    o += R(90, 132, 20, 16, 0, borde, null);
    o += R(d.x - 9, d.y + d.h / 2 - 11, 10, 22, 3, borde, null) +
         R(d.x + d.w - 1, d.y + d.h / 2 - 11, 10, 22, 3, borde, null);

    // Cabeza
    if (cfg.cabeza === "hexagonal") {
      o += PG((d.x + 20) + "," + d.y + " " + (d.x + d.w - 20) + "," + d.y + " " +
              (d.x + d.w) + "," + (d.y + d.h / 2) + " " + (d.x + d.w - 20) + "," + (d.y + d.h) + " " +
              (d.x + 20) + "," + (d.y + d.h) + " " + d.x + "," + (d.y + d.h / 2), color, borde, 4);
    } else {
      o += R(d.x, d.y, d.w, d.h, d.r, color, borde, 4);
    }
    o += R(sx, sy, sw, sh, 10, pant, borde, 2);

    // Ojos
    switch (cfg.ojos) {
      case "visor":
        o += R(cx - sw * 0.35, ojoY - 5, sw * 0.7, 10, 5, luz, null);
        break;
      case "ciclope":
        o += C(cx, ojoY, 13, luz, null) + C(cx, ojoY, 5, pant, null);
        break;
      case "x":
        [-dx, dx].forEach(function (off) {
          var x = cx + off;
          o += L(x - 7, ojoY - 7, x + 7, ojoY + 7, luz, 4) + L(x + 7, ojoY - 7, x - 7, ojoY + 7, luz, 4);
        });
        break;
      case "felices":
        [-dx, dx].forEach(function (off) {
          var x = cx + off;
          o += P("M " + (x - 8) + " " + (ojoY + 4) + " Q " + x + " " + (ojoY - 10) + " " +
                 (x + 8) + " " + (ojoY + 4), null, luz, 4);
        });
        break;
      default:
        o += C(cx - dx, ojoY, 8, luz, null) + C(cx + dx, ojoY, 8, luz, null);
    }

    // Boca
    switch (cfg.boca) {
      case "sonrisa":
        o += P("M " + (cx - 14) + " " + (bocaY - 3) + " Q " + cx + " " + (bocaY + 10) + " " +
               (cx + 14) + " " + (bocaY - 3), null, luz, 4);
        break;
      case "linea":
        o += L(cx - 14, bocaY, cx + 14, bocaY, luz, 4);
        break;
      case "o":
        o += C(cx, bocaY, 6, null, luz, 4);
        break;
      default:
        [-12, -4, 4, 12].forEach(function (off) {
          o += L(cx + off, bocaY - 5, cx + off, bocaY + 5, luz, 4);
        });
    }

    // Panel del pecho
    o += C(100, 172, 8, acento, borde, 2) + C(82, 192, 3.5, luz, null) +
         C(100, 192, 3.5, "#ff6b6b", null) + C(118, 192, 3.5, luz, null);
    return o;
  }

  // ---------- HUMANO ----------
  function dibujarHumano(cfg, color, borde) {
    var piel = PIELES[cfg.cabeza] || PIELES.media;
    var pielOsc = mezclar(piel, "#000000", 0.25);
    var pelo = PELOS[cfg.pelocolor] || PELOS.castano;
    var peloOsc = mezclar(pelo, "#000000", 0.3);
    var colorOsc = mezclar(color, "#000000", 0.2);
    var tinta = "#222222";
    var o = "";

    // Pelo trasero (largo)
    if (cfg.extra === "largo") {
      o += R(62, 50, 76, 100, 32, pelo, peloOsc, 3);
    }

    // Brazos y cuerpo según la ropa
    if (cfg.cuerpo === "sudadera") {
      o += R(40, 142, 20, 58, 10, color, borde, 3) + R(140, 142, 20, 58, 10, color, borde, 3) +
           C(50, 204, 8, piel, pielOsc, 2) + C(150, 204, 8, piel, pielOsc, 2);
    } else if (cfg.cuerpo === "tirantes") {
      o += R(44, 146, 14, 52, 7, piel, pielOsc, 3) + R(142, 146, 14, 52, 7, piel, pielOsc, 3) +
           C(51, 202, 7, piel, pielOsc, 2) + C(149, 202, 7, piel, pielOsc, 2);
    } else {
      o += R(44, 164, 13, 34, 6, piel, pielOsc, 3) + R(143, 164, 13, 34, 6, piel, pielOsc, 3) +
           C(50, 202, 7, piel, pielOsc, 2) + C(150, 202, 7, piel, pielOsc, 2) +
           R(42, 142, 20, 28, 10, color, borde, 3) + R(138, 142, 20, 28, 10, color, borde, 3);
    }
    // Cuello
    o += R(91, 118, 18, 28, 5, pielOsc, null);
    // Torso
    o += R(58, 138, 84, 74, 22, color, borde, 4);
    // Escote / cuello de la ropa
    if (cfg.cuerpo === "sudadera") {
      o += E(100, 139, 24, 8, colorOsc, borde, 2) +
           L(94, 146, 94, 164, "#ffffff", 2) + L(106, 146, 106, 164, "#ffffff", 2);
    } else if (cfg.cuerpo === "tirantes") {
      o += P("M76 138 Q100 168 124 138 Z", piel, pielOsc, 2);
    } else {
      o += PG("84,138 116,138 100,154", piel, borde, 2);
    }

    // Orejas y cabeza
    o += C(66, 92, 7, piel, pielOsc, 3) + C(134, 92, 7, piel, pielOsc, 3);
    o += E(100, 86, 34, 40, piel, pielOsc, 3);

    // Pelo (frente)
    switch (cfg.extra) {
      case "corto":
      case "largo":
        o += P("M65 84 Q62 42 100 42 Q138 42 135 84 Q128 62 100 60 Q72 62 65 84 Z", pelo, peloOsc, 2);
        break;
      case "rizado":
        [[70, 62, 15], [86, 48, 16], [114, 48, 16], [130, 62, 15], [100, 44, 15], [66, 82, 10], [134, 82, 10]]
          .forEach(function (c) { o += C(c[0], c[1], c[2], pelo, peloOsc, 2); });
        break;
      case "gorra":
        o += P("M64 76 Q62 34 100 34 Q138 34 136 76 Z", color, borde, 3) +
             R(56, 70, 92, 10, 5, colorOsc, borde, 3);
        break;
      case "mohicano":
        o += PG("90,62 91,34 98,48 101,28 106,48 112,34 110,62", pelo, peloOsc, 2);
        break;
    }

    // Cejas
    var ceja = cfg.extra === "calvo" ? pielOsc : pelo;
    if (cfg.ojos !== "felices" && cfg.ojos !== "cerrados") {
      o += L(76, 81, 95, 79, ceja, 3) + L(105, 79, 124, 81, ceja, 3);
    }

    // Ojos
    switch (cfg.ojos) {
      case "felices":
        o += P("M79 95 Q86 86 93 95", null, tinta, 3) + P("M107 95 Q114 86 121 95", null, tinta, 3);
        break;
      case "guino":
        o += P("M79 93 Q86 98 93 93", null, tinta, 3) +
             E(114, 92, 7, 5, "#ffffff", pielOsc, 1.5) + C(114, 92, 3, tinta, null);
        break;
      case "lentes":
        o += E(86, 92, 7, 5, "#ffffff", pielOsc, 1.5) + C(86, 92, 3, tinta, null) +
             E(114, 92, 7, 5, "#ffffff", pielOsc, 1.5) + C(114, 92, 3, tinta, null) +
             C(86, 92, 12, null, tinta, 3) + C(114, 92, 12, null, tinta, 3) +
             L(98, 92, 102, 92, tinta, 3);
        break;
      case "cerrados":
        o += L(79, 93, 93, 93, tinta, 3) + L(107, 93, 121, 93, tinta, 3);
        break;
      default:
        o += E(86, 92, 7, 5, "#ffffff", pielOsc, 1.5) + C(86, 92, 3, tinta, null) +
             E(114, 92, 7, 5, "#ffffff", pielOsc, 1.5) + C(114, 92, 3, tinta, null);
    }

    // Nariz
    o += P("M99 96 Q94 106 100 107", null, pielOsc, 2.5);

    // Boca
    var rojo = "#7a2e2e";
    switch (cfg.boca) {
      case "seria":
        o += L(91, 114, 109, 114, rojo, 3.5);
        break;
      case "abierta":
        o += E(100, 115, 9, 6, "#7a1f1f", null) + R(93, 110, 14, 4, 2, "#ffffff", null);
        break;
      case "lengua":
        o += E(100, 119, 5, 4, "#ff8fa3", null) + P("M88 111 Q100 124 112 111", null, rojo, 3.5);
        break;
      default:
        o += P("M88 111 Q100 124 112 111", null, rojo, 3.5);
    }
    return o;
  }

  // ---------- ESQUELETO ----------
  function dibujarEsqueleto(cfg, color, borde) {
    var hueso = "#f3ecd8", huesoB = "#8a8470", hueco = "#1b1f2a";
    var colorOsc = mezclar(color, "#000000", 0.25);
    var sk;
    if (cfg.cabeza === "ovalada") sk = { cy: 80, rx: 32, ry: 42 };
    else if (cfg.cabeza === "ancha") sk = { cy: 84, rx: 42, ry: 36 };
    else sk = { cy: 80, rx: 38, ry: 40 };
    var cx = 100;
    var ey = sk.cy + 2;
    var ex = Math.round(sk.rx * 0.42);
    var ty = sk.cy - sk.ry;
    var my = sk.cy + 42;
    var o = "";

    // Cuello
    o += R(94, 128, 12, 22, 4, hueso, huesoB, 3);

    // Torso
    if (cfg.cuerpo === "playera") {
      o += R(46, 164, 10, 34, 5, hueso, huesoB, 3) + R(144, 164, 10, 34, 5, hueso, huesoB, 3) +
           C(51, 202, 7, hueso, huesoB, 3) + C(149, 202, 7, hueso, huesoB, 3) +
           R(42, 142, 22, 26, 10, color, borde, 3) + R(136, 142, 22, 26, 10, color, borde, 3) +
           R(60, 140, 80, 72, 12, color, borde, 4) +
           PG("86,140 114,140 100,154", hueso, huesoB, 2);
    } else if (cfg.cuerpo === "sudadera") {
      o += R(40, 144, 22, 56, 10, color, borde, 3) + R(138, 144, 22, 56, 10, color, borde, 3) +
           C(51, 206, 7, hueso, huesoB, 3) + C(149, 206, 7, hueso, huesoB, 3) +
           R(60, 140, 80, 72, 12, color, borde, 4) +
           E(100, 141, 24, 8, colorOsc, borde, 2) +
           L(94, 146, 94, 164, "#ffffff", 2) + L(106, 146, 106, 164, "#ffffff", 2);
    } else {
      o += R(42, 148, 10, 54, 5, hueso, huesoB, 3) + R(148, 148, 10, 54, 5, hueso, huesoB, 3) +
           C(47, 206, 7, hueso, huesoB, 3) + C(153, 206, 7, hueso, huesoB, 3);
      o += R(95, 134, 10, 66, 5, hueso, huesoB, 3);
      [152, 164, 176, 188].forEach(function (y) {
        var izq = "M100 " + y + " Q78 " + (y - 8) + " 72 " + (y + 8);
        var der = "M100 " + y + " Q122 " + (y - 8) + " 128 " + (y + 8);
        o += P(izq, null, huesoB, 9) + P(der, null, huesoB, 9) +
             P(izq, null, hueso, 5) + P(der, null, hueso, 5);
      });
      var cl1 = "M100 146 Q82 140 64 150", cl2 = "M100 146 Q118 140 136 150";
      o += P(cl1, null, huesoB, 8) + P(cl2, null, huesoB, 8) + P(cl1, null, hueso, 4) + P(cl2, null, hueso, 4);
      o += E(100, 206, 22, 9, hueso, huesoB, 3) + R(70, 198, 60, 9, 3, color, borde, 3);
    }

    // Mandíbula y cráneo
    o += R(cx - 24, sk.cy + 30, 48, 26, 9, hueso, huesoB, 3);
    o += E(cx, sk.cy, sk.rx, sk.ry, hueso, huesoB, 3.5);

    // Boca
    switch (cfg.boca) {
      case "sonrisa":
        o += P("M" + (cx - 20) + " " + (my - 4) + " Q" + cx + " " + (my + 12) + " " + (cx + 20) + " " + (my - 4), null, huesoB, 3);
        break;
      case "linea":
        o += L(cx - 16, my, cx + 16, my, huesoB, 3);
        [-12, -6, 0, 6, 12].forEach(function (off) {
          o += L(cx + off, my - 4, cx + off, my + 4, huesoB, 2);
        });
        break;
      case "o":
        o += E(cx, my + 1, 6, 7, hueco, null);
        break;
      default:
        o += R(cx - 18, my - 6, 36, 14, 3, "#ffffff", huesoB, 2) +
             L(cx - 9, my - 6, cx - 9, my + 8, huesoB, 1.5) +
             L(cx, my - 6, cx, my + 8, huesoB, 1.5) +
             L(cx + 9, my - 6, cx + 9, my + 8, huesoB, 1.5) +
             L(cx - 18, my + 1, cx + 18, my + 1, huesoB, 1.5);
    }

    // Nariz
    o += PG(cx + "," + (sk.cy + 12) + " " + (cx - 5) + "," + (sk.cy + 24) + " " + cx + "," + (sk.cy + 21) +
            " " + (cx + 5) + "," + (sk.cy + 24), hueco, null);

    // Ojos
    var xs = [cx - ex, cx + ex];
    switch (cfg.ojos) {
      case "enojados":
        o += E(xs[0], ey, 10, 8, hueco, null, null, 22) + E(xs[1], ey, 10, 8, hueco, null, null, -22);
        break;
      case "tristes":
        o += E(xs[0], ey, 10, 8, hueco, null, null, -22) + E(xs[1], ey, 10, 8, hueco, null, null, 22);
        break;
      case "x":
        xs.forEach(function (x) {
          o += L(x - 8, ey - 8, x + 8, ey + 8, hueco, 4) + L(x + 8, ey - 8, x - 8, ey + 8, hueco, 4);
        });
        break;
      case "brillantes":
        xs.forEach(function (x) {
          o += E(x, ey, 10, 11, hueco, null) + C(x, ey, 7, "rgba(255,59,59,0.35)", null) + C(x, ey, 3.5, "#ff3b3b", null);
        });
        break;
      default:
        xs.forEach(function (x) { o += E(x, ey, 10, 11, hueco, null); });
    }

    // Accesorio
    switch (cfg.extra) {
      case "sombrero":
        o += R(cx - 26, ty - 34, 52, 32, 4, color, borde, 3) +
             R(cx - 26, ty - 12, 52, 7, 0, colorOsc, null) +
             R(cx - 40, ty - 4, 80, 9, 4, colorOsc, borde, 3);
        break;
      case "corona":
        o += PG((cx - 30) + "," + (ty + 6) + " " + (cx - 26) + "," + (ty - 14) + " " + (cx - 14) + "," + (ty - 2) + " " +
                cx + "," + (ty - 20) + " " + (cx + 14) + "," + (ty - 2) + " " + (cx + 26) + "," + (ty - 14) + " " +
                (cx + 30) + "," + (ty + 6), "#ffd166", borde, 3);
        break;
      case "lazo":
        o += PG("100,146 82,136 82,156", color, borde, 3) + PG("100,146 118,136 118,156", color, borde, 3) +
             C(100, 146, 5, colorOsc, borde, 2);
        break;
      case "parche":
        o += L(cx + ex, ey, cx - sk.rx + 4, ey - 18, "#222222", 3) +
             L(cx + ex, ey, cx + sk.rx - 4, ey - 14, "#222222", 3) +
             C(cx + ex, ey, 12, "#222222", null);
        break;
    }
    return o;
  }

  // ---------- ALIEN ----------
  function dibujarAlien(cfg, color, borde) {
    var claro = mezclar(color, "#ffffff", 0.35);
    var oscuro = mezclar(color, "#000000", 0.35);
    var acento = "#ffd166";
    var negro = "#111111";
    var o = "";

    // Antenas y orejas (detrás de la cabeza)
    if (cfg.extra === "dos") {
      o += L(78, 48, 66, 22, borde, 4) + L(122, 48, 134, 22, borde, 4) +
           C(66, 18, 6, acento, borde, 3) + C(134, 18, 6, acento, borde, 3);
    } else if (cfg.extra === "una") {
      o += L(100, 40, 100, 16, borde, 4) + C(100, 12, 6, acento, borde, 3);
    } else if (cfg.extra === "orejas") {
      o += PG("62,82 34,60 58,102", color, borde, 3) + PG("138,82 166,60 142,102", color, borde, 3);
    }

    // Brazos
    function brazo(x1, y1, x2, y2) {
      return L(x1, y1, x2, y2, borde, 13) + L(x1, y1, x2, y2, color, 7) + C(x2, y2, 6, color, borde, 3);
    }
    o += brazo(76, 152, 48, 198) + brazo(124, 152, 152, 198);

    // Cuello y cuerpo
    o += R(92, 126, 16, 22, 6, color, borde, 3);
    if (cfg.cuerpo === "redondo") {
      o += E(100, 178, 36, 36, color, borde, 4) + E(100, 186, 20, 22, claro, null);
    } else if (cfg.cuerpo === "trapecio") {
      o += PG("78,142 122,142 142,212 58,212", color, borde, 4) + E(100, 186, 16, 18, claro, null);
    } else {
      o += R(78, 140, 44, 72, 16, color, borde, 4) + E(100, 182, 14, 20, claro, null);
    }

    // Cabeza
    var forma;
    if (cfg.cabeza === "grande") {
      forma = "M100 36 Q156 36 150 88 Q144 132 100 138 Q56 132 50 88 Q44 36 100 36 Z";
    } else if (cfg.cabeza === "triangular") {
      forma = "M60 54 Q100 34 140 54 Q144 100 100 138 Q56 100 60 54 Z";
    } else {
      forma = "M100 42 Q146 42 140 88 Q136 126 100 134 Q64 126 60 88 Q54 42 100 42 Z";
    }
    o += P(forma, color, borde, 4);

    // Ojos
    switch (cfg.ojos) {
      case "tres":
        o += E(80, 96, 9, 14, negro, null, null, -28) + E(120, 96, 9, 14, negro, null, null, 28) +
             C(100, 66, 7, negro, null) + C(98, 64, 2, "#ffffff", null) +
             C(77, 91, 2.5, "#ffffff", null) + C(117, 91, 2.5, "#ffffff", null);
        break;
      case "ciclope":
        o += C(100, 92, 19, negro, null) + C(100, 92, 8, "#7df9ff", null) + C(94, 86, 3, "#ffffff", null);
        break;
      case "felices":
        o += P("M66 98 Q78 82 90 98", null, negro, 5) + P("M110 98 Q122 82 134 98", null, negro, 5);
        break;
      case "ranura":
        o += E(80, 94, 13, 4, negro, null, null, -14) + E(120, 94, 13, 4, negro, null, null, 14) +
             E(80, 94, 4, 2, acento, null) + E(120, 94, 4, 2, acento, null);
        break;
      default:
        o += E(78, 94, 12, 19, negro, null, null, -28) + E(122, 94, 12, 19, negro, null, null, 28) +
             C(72, 88, 3, "#ffffff", null) + C(116, 88, 3, "#ffffff", null);
    }

    // Nariz y boca
    o += C(96, 106, 1.6, oscuro, null) + C(104, 106, 1.6, oscuro, null);
    switch (cfg.boca) {
      case "sonrisa":
        o += P("M86 114 Q100 126 114 114", null, negro, 3.5);
        break;
      case "linea":
        o += L(88, 118, 112, 118, negro, 3.5);
        break;
      case "dientes":
        o += R(84, 111, 32, 14, 7, negro, null);
        [88, 95, 102, 109].forEach(function (x) {
          o += PG(x + ",112 " + (x + 6) + ",112 " + (x + 3) + ",119", "#ffffff", null);
        });
        break;
      default:
        o += E(100, 118, 5, 2.5, negro, null);
    }
    return o;
  }

  // ---------- Dibujo principal ----------
  function avatarSVG(cfg, color) {
    var borde = luminosidad(color) > 140
      ? mezclar(color, "#000000", 0.3)
      : mezclar(color, "#ffffff", 0.3);
    var dentro;
    switch (cfg.tipo) {
      case "humano":    dentro = dibujarHumano(cfg, color, borde); break;
      case "esqueleto": dentro = dibujarEsqueleto(cfg, color, borde); break;
      case "alien":     dentro = dibujarAlien(cfg, color, borde); break;
      default:          dentro = dibujarRobot(cfg, color, borde);
    }
    return '<svg viewBox="0 0 200 225" xmlns="http://www.w3.org/2000/svg">' + dentro + '</svg>';
  }

  // ---------- Estilos de la interfaz ----------
  function inyectarEstilos() {
    if (document.getElementById("avatar-estilos")) return;
    var css = [
      ".av-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); display: flex; align-items: center; justify-content: center; z-index: 2000; font-family: system-ui, sans-serif; }",
      ".av-card { background: #fff; border-radius: 18px; padding: 22px; width: min(94vw, 480px); max-height: 94vh; overflow-y: auto; box-shadow: 0 12px 40px rgba(0,0,0,.35); }",
      ".av-titulo { font-size: 1.2rem; font-weight: 700; text-align: center; margin-bottom: 12px; }",
      ".av-preview { width: 190px; height: 214px; margin: 0 auto 12px; background: #f1f2f6; border-radius: 16px; padding: 6px; }",
      ".av-preview svg { width: 100%; height: 100%; }",
      ".av-tabs { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 12px; }",
      ".av-tab { border: none; padding: 7px 12px; border-radius: 20px; background: #e5e7ee; cursor: pointer; font-size: .85rem; }",
      ".av-tab.activo { background: #222; color: #fff; }",
      ".av-opciones { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px; }",
      ".av-op { border: 3px solid transparent; background: #f1f2f6; border-radius: 12px; padding: 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: .7rem; color: #444; }",
      ".av-op:hover { background: #e5e7ee; }",
      ".av-op.activo { border-color: #222; }",
      ".av-op svg { width: 100%; height: auto; display: block; }",
      ".av-acciones { display: flex; gap: 10px; margin-top: 16px; }",
      ".av-acciones button { flex: 1; padding: 11px; border: none; border-radius: 10px; font-size: .95rem; cursor: pointer; }",
      ".av-sec { background: #e5e7ee; }",
      ".av-prim { background: #222; color: #fff; }",
      ".av-insignia { position: fixed; top: 16px; right: 16px; width: 64px; height: 72px; padding: 4px; background: #fff; border-radius: 14px; border: none; cursor: pointer; z-index: 1500; box-shadow: 0 4px 14px rgba(0,0,0,.25); }",
      ".av-insignia svg { width: 100%; height: 100%; }"
    ].join("\n");
    var s = document.createElement("style");
    s.id = "avatar-estilos";
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Estado ----------
  var cfgActual = nuevoCfg("robot");

  function aleatorio() {
    var tipos = Object.keys(TIPOS);
    var tipo = tipos[Math.floor(Math.random() * tipos.length)];
    var cfg = { tipo: tipo };
    TIPOS[tipo].cats.forEach(function (c) {
      cfg[c.k] = c.v[Math.floor(Math.random() * c.v.length)];
    });
    return cfg;
  }

  function nombreBonito(v) {
    var t = v.charAt(0).toUpperCase() + v.slice(1);
    return t.replace("Guino", "Guiño").replace("Castano", "Castaño").replace("Pequena", "Pequeña").replace("Craneo", "Cráneo");
  }

  // ---------- Selector de avatar ----------
  function abrirSelectorAvatar(color) {
    inyectarEstilos();
    var previo = document.querySelector(".av-overlay");
    if (previo) previo.remove();

    var cfg = Object.assign({}, cfgActual);
    var categoria = "tipo";

    var overlay = document.createElement("div");
    overlay.className = "av-overlay";
    overlay.innerHTML =
      '<div class="av-card">' +
        '<div class="av-titulo">Crea tu avatar</div>' +
        '<div class="av-preview"></div>' +
        '<div class="av-tabs"></div>' +
        '<div class="av-opciones"></div>' +
        '<div class="av-acciones">' +
          '<button class="av-sec" data-acc="azar">🎲 Aleatorio</button>' +
          '<button class="av-prim" data-acc="ok">Elegir avatar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var preview = overlay.querySelector(".av-preview");
    var tabs = overlay.querySelector(".av-tabs");
    var opciones = overlay.querySelector(".av-opciones");

    function pintar() {
      var lista = [{ k: "tipo", e: "Tipo", v: Object.keys(TIPOS) }].concat(TIPOS[cfg.tipo].cats);
      var actual = lista.filter(function (c) { return c.k === categoria; })[0];
      if (!actual) { categoria = "tipo"; actual = lista[0]; }

      preview.innerHTML = avatarSVG(cfg, color);

      tabs.innerHTML = "";
      lista.forEach(function (c) {
        var b = document.createElement("button");
        b.className = "av-tab" + (c.k === categoria ? " activo" : "");
        b.textContent = c.e;
        b.addEventListener("click", function () { categoria = c.k; pintar(); });
        tabs.appendChild(b);
      });

      opciones.innerHTML = "";
      actual.v.forEach(function (valor) {
        var prueba;
        var activa;
        if (categoria === "tipo") {
          prueba = nuevoCfg(valor);
          activa = cfg.tipo === valor;
        } else {
          prueba = Object.assign({}, cfg);
          prueba[categoria] = valor;
          activa = cfg[categoria] === valor;
        }
        var b = document.createElement("button");
        b.className = "av-op" + (activa ? " activo" : "");
        b.title = valor;
        b.innerHTML = avatarSVG(prueba, color) + "<span>" +
          (categoria === "tipo" ? TIPOS[valor].etiqueta : nombreBonito(valor)) + "</span>";
        b.addEventListener("click", function () {
          if (categoria === "tipo") {
            cfg = nuevoCfg(valor);
          } else {
            cfg[categoria] = valor;
          }
          pintar();
        });
        opciones.appendChild(b);
      });
    }

    overlay.querySelector('[data-acc="azar"]').addEventListener("click", function () {
      cfg = aleatorio();
      pintar();
    });

    overlay.querySelector('[data-acc="ok"]').addEventListener("click", function () {
      cfgActual = Object.assign({}, cfg);
      var avatar = Object.assign({ color: color }, cfg);
      window.avatarElegido = avatar;
      overlay.remove();
      mostrarInsignia(avatar);
      document.dispatchEvent(new CustomEvent("avatar-elegido", { detail: avatar }));
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });

    function esc(e) {
      if (e.key === "Escape") {
        overlay.remove();
        document.removeEventListener("keydown", esc);
      }
    }
    document.addEventListener("keydown", esc);

    pintar();
  }

  // ---------- Insignia con el avatar elegido ----------
  function mostrarInsignia(avatar) {
    var b = document.querySelector(".av-insignia");
    if (!b) {
      b = document.createElement("button");
      b.className = "av-insignia";
      b.title = "Cambiar avatar";
      b.addEventListener("click", function () {
        abrirSelectorAvatar(window.avatarElegido.color);
      });
      document.body.appendChild(b);
    }
    b.innerHTML = avatarSVG(avatar, avatar.color);
  }

  // ---------- Conexión con la paleta ----------
  var btnCopiar = document.getElementById("copiar");
  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      // Espera a que la paleta se minimice y entonces abre el selector
      setTimeout(function () {
        var color = (typeof colorElegido !== "undefined" && colorElegido) || "#3498db";
        abrirSelectorAvatar(color);
      }, 900);
    });
  }

  // Por si quieres usarlos desde otro lado
  window.abrirSelectorAvatar = abrirSelectorAvatar;
  window.avatarSVG = avatarSVG;

  // ---------- Aquí continúas tu código ----------
  document.addEventListener("avatar-elegido", function (e) {
    console.log("Avatar elegido:", e.detail);
    // e.detail = { color, tipo, cabeza, ojos, boca, extra, cuerpo }
    // (si tipo es "humano" también trae pelocolor)
  });
})();