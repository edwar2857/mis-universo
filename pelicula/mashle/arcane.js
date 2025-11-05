const episodioPorPagina = 6;
const paginaActual = { 1: 0, 2: 0 };

const enlaces = {
  // Temporada 1
  1: "https://www.tokyvideo.com/es/embed/487417",
  2: "https://www.tokyvideo.com/es/embed/487434",
  // ...
  3: "https://www.tokyvideo.com/es/embed/487501",
  4: "https://www.tokyvideo.com/es/embed/487514",
  5: "https://www.tokyvideo.com/es/embed/487559",
  6: "https://www.tokyvideo.com/es/embed/493924",
  7: "https://www.tokyvideo.com/es/embed/493940",
  8: "https://www.tokyvideo.com/es/embed/493947",
  9: "https://www.tokyvideo.com/es/embed/493961",
  //Temporada 2
  10: "https://www.tokyvideo.com/es/embed/627277",
  11: "https://www.tokyvideo.com/es/embed/627281",
  12: "https://www.tokyvideo.com/es/embed/627283",
  13: "https://www.tokyvideo.com/es/embed/626928",
  14: "https://www.tokyvideo.com/es/embed/626979",
  15: "https://www.tokyvideo.com/es/embed/626984",
  16: "https://www.tokyvideo.com/es/embed/626989",
  17: "https://www.tokyvideo.com/es/embed/626996",
  18: "https://www.tokyvideo.com/es/embed/627181",
  // ... agrega más enlaces según episodios
};

function generarBotones() {
  const contenedor1 = document.getElementById("episodios1");
  const contenedor2 = document.getElementById("episodios2");

  // Helper to create accessible button-like anchors
  function crearBoton(epNum, text) {
    const btn = document.createElement("a");
    btn.href = "#";
    btn.className = "boton ep";
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.dataset.ep = epNum;
    btn.textContent = text;

    // click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cargarEpisodio(epNum);
    });

    // keyboard handler (Enter / Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cargarEpisodio(epNum);
      }
    });

    return btn;
  }

  for (let i = 1; i <= 9; i++) {
    const text = `Ep ${String(i).padStart(2, '0')}`;
    contenedor1.appendChild(crearBoton(i, text));
  }

  for (let i = 10; i <= 18; i++) {
    const text = `Ep ${String(i - 9).padStart(2, '0')}`;
    contenedor2.appendChild(crearBoton(i, text));
  }
}

function mostrarTemporada(num) {
  document.getElementById("temporada1").style.display = num === 1 ? "block" : "none";
  document.getElementById("temporada2").style.display = num === 2 ? "block" : "none";
  document.getElementById("titulo").textContent = `Arcane - Temporada ${num}`;
  paginaActual[num] = 0;
  actualizarBotones(num);
  document.querySelectorAll(".boton.menu").forEach(btn => btn.classList.remove("activa"));
  document.getElementById(`btnTemp${num}`).classList.add("activa");
}

function cargarEpisodio(num) {
  const iframe = document.getElementById("videoFrame");
  const tempNum = num <= 9 ? 1 : 2;
  const epNum = tempNum === 1 ? num : num - 9;
  const url = enlaces[num];
  if (!url) {
    // URL missing: show friendly message in title and do not change iframe src
    document.getElementById("titulo").textContent = `Arcane T${tempNum} Ep ${epNum} (enlace no disponible)`;
    return;
  }

  iframe.src = url;
  document.getElementById("titulo").textContent = `Arcane T${tempNum} Ep ${epNum}`;

  // marcar como activo
  document.querySelectorAll('.boton.ep').forEach(b => b.classList.remove('activa'));
  const sel = document.querySelector(`.boton.ep[data-ep='${num}']`);
  if (sel) {
    sel.classList.add('activa');
    // ensure selected episode is visible in its temporada pagination
    const temporada = tempNum;
    const contenedor = document.getElementById(`episodios${temporada}`);
    const botones = Array.from(contenedor.querySelectorAll('.boton.ep'));
    const idx = botones.indexOf(sel);
    if (idx >= 0) {
      paginaActual[temporada] = Math.floor(idx / episodioPorPagina);
      actualizarBotones(temporada);
    }
    // move focus to the selected element for accessibility
    sel.focus();
  }
}

function actualizarBotones(temporada) {
  const contenedor = document.getElementById(`episodios${temporada}`);
  const botones = contenedor.querySelectorAll(".boton.ep");
  const total = botones.length;
  const inicio = paginaActual[temporada] * episodioPorPagina;
  const fin = inicio + episodioPorPagina;

  botones.forEach((btn, i) => {
    btn.style.display = i >= inicio && i < fin ? "inline-block" : "none";
  });

  const nav = document.querySelector(`#temporada${temporada} .navegacion`);
  const anterior = nav.querySelector(".anterior");
  const siguiente = nav.querySelector(".siguiente");
  anterior.style.display = paginaActual[temporada] > 0 ? "inline-block" : "none";
  siguiente.style.display = fin < total ? "inline-block" : "none";

  // if currently active episode is hidden by pagination, move active to first visible
  const activaVisible = Array.from(botones).some((b, i) => b.classList.contains('activa') && i >= inicio && i < fin);
  if (!activaVisible) {
    // find first visible button and set focusable state
    for (let i = inicio; i < Math.min(fin, total); i++) {
      botones[i].classList.remove('activa');
    }
  }
}

function cambiarPagina(temporada, direccion) {
  const contenedor = document.getElementById(`episodios${temporada}`);
  const totalBotones = contenedor.querySelectorAll(".boton.ep").length;
  const maxPaginas = Math.ceil(totalBotones / episodioPorPagina);

  const nuevaPagina = paginaActual[temporada] + direccion;
  if (nuevaPagina >= 0 && nuevaPagina < maxPaginas) {
    paginaActual[temporada] = nuevaPagina;
    actualizarBotones(temporada);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  generarBotones();
  // mostrar temporada 1 por defecto y cargar primer episodio disponible
  mostrarTemporada(1);
  // intentar precargar episodio 1 si existe
  if (enlaces[1]) {
    cargarEpisodio(1);
  } else {
    // si no existe enlace 1, buscar el primer enlace disponible
    const primeros = Object.keys(enlaces).map(k => parseInt(k,10)).sort((a,b)=>a-b);
    if (primeros.length) cargarEpisodio(primeros[0]);
  }
});
