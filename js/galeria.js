/*
 * Galería de producto: al pulsar una tarjeta (.producto) se abre una vista
 * ampliada con carrusel de fotos.
 *
 * Fotos extra (opcional): atributo data-imagenes en el <article>, con las
 * rutas separadas por comas. La imagen de la tarjeta es siempre la primera.
 */
(function () {
  const tarjetas = document.querySelectorAll('.producto');
  if (!tarjetas.length) return;

  // ---------- Estructura del modal ----------
  const modal = document.createElement('div');
  modal.className = 'galeria';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Vista ampliada del producto');
  modal.innerHTML =
    '<div class="galeria-ventana">' +
      '<button type="button" class="galeria-cerrar" aria-label="Cerrar">&times;</button>' +
      '<div class="galeria-escenario">' +
        '<button type="button" class="galeria-flecha galeria-anterior" aria-label="Foto anterior">' +
          '<i class="fa-solid fa-chevron-left"></i></button>' +
        '<img class="galeria-imagen" alt="">' +
        '<button type="button" class="galeria-flecha galeria-siguiente" aria-label="Foto siguiente">' +
          '<i class="fa-solid fa-chevron-right"></i></button>' +
        '<span class="galeria-contador"></span>' +
      '</div>' +
      '<div class="galeria-info">' +
        '<p class="galeria-titulo"></p>' +
        '<span class="galeria-etiqueta"></span>' +
        '<div class="galeria-miniaturas"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);

  const ventana = modal.querySelector('.galeria-ventana');
  const escenario = modal.querySelector('.galeria-escenario');
  const imagen = modal.querySelector('.galeria-imagen');
  const contador = modal.querySelector('.galeria-contador');
  const titulo = modal.querySelector('.galeria-titulo');
  const etiqueta = modal.querySelector('.galeria-etiqueta');
  const miniaturas = modal.querySelector('.galeria-miniaturas');
  const btnCerrar = modal.querySelector('.galeria-cerrar');
  const btnAnterior = modal.querySelector('.galeria-anterior');
  const btnSiguiente = modal.querySelector('.galeria-siguiente');

  let fotos = [];
  let indice = 0;
  let nombre = '';
  let elementoPrevio = null;

  // ---------- Carrusel ----------
  function mostrar(nuevo) {
    indice = (nuevo + fotos.length) % fotos.length;

    imagen.classList.add('cambiando');
    setTimeout(function () {
      imagen.src = fotos[indice];
      imagen.alt = nombre + ' (foto ' + (indice + 1) + ' de ' + fotos.length + ')';
      imagen.classList.remove('cambiando');
    }, 120);

    contador.textContent = (indice + 1) + ' / ' + fotos.length;

    miniaturas.querySelectorAll('.galeria-miniatura').forEach(function (m, i) {
      m.classList.toggle('activa', i === indice);
      if (i === indice) m.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }

  function crearMiniaturas() {
    miniaturas.innerHTML = '';
    fotos.forEach(function (src, i) {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'galeria-miniatura';
      boton.setAttribute('aria-label', 'Ver foto ' + (i + 1));
      const mini = document.createElement('img');
      mini.src = src;
      mini.alt = '';
      boton.appendChild(mini);
      boton.addEventListener('click', function () { mostrar(i); });
      miniaturas.appendChild(boton);
    });
  }

  // ---------- Abrir / cerrar ----------
  function abrir(tarjeta) {
    const imgTarjeta = tarjeta.querySelector('img');
    if (!imgTarjeta) return;

    const extras = (tarjeta.dataset.imagenes || '')
      .split(',')
      .map(function (ruta) { return ruta.trim(); })
      .filter(Boolean);

    fotos = [imgTarjeta.getAttribute('src')].concat(extras);
    nombre = tarjeta.querySelector('.card-model')
      ? tarjeta.querySelector('.card-model').textContent.trim()
      : imgTarjeta.alt;

    const tag = tarjeta.querySelector('.card-tag');
    titulo.textContent = nombre;
    etiqueta.textContent = tag ? tag.textContent : '';
    etiqueta.style.display = tag ? '' : 'none';

    modal.classList.toggle('una-imagen', fotos.length === 1);
    crearMiniaturas();

    imagen.src = fotos[0];
    imagen.alt = nombre;
    indice = 0;
    contador.textContent = '1 / ' + fotos.length;
    miniaturas.firstChild.classList.add('activa');

    elementoPrevio = document.activeElement;
    modal.classList.add('abierta');
    document.body.classList.add('galeria-abierta');
    btnCerrar.focus();
  }

  function cerrar() {
    modal.classList.remove('abierta');
    document.body.classList.remove('galeria-abierta');
    if (elementoPrevio) elementoPrevio.focus();
  }

  function estaAbierta() {
    return modal.classList.contains('abierta');
  }

  // ---------- Eventos ----------
  tarjetas.forEach(function (tarjeta) {
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'button');
    tarjeta.addEventListener('click', function () { abrir(tarjeta); });
    tarjeta.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrir(tarjeta);
      }
    });
  });

  btnCerrar.addEventListener('click', cerrar);
  btnAnterior.addEventListener('click', function () { mostrar(indice - 1); });
  btnSiguiente.addEventListener('click', function () { mostrar(indice + 1); });

  // Clic fuera de la ventana
  modal.addEventListener('click', function (e) {
    if (!ventana.contains(e.target)) cerrar();
  });

  document.addEventListener('keydown', function (e) {
    if (!estaAbierta()) return;

    if (e.key === 'Escape') cerrar();
    else if (e.key === 'ArrowLeft' && fotos.length > 1) mostrar(indice - 1);
    else if (e.key === 'ArrowRight' && fotos.length > 1) mostrar(indice + 1);
    else if (e.key === 'Tab') {
      // Mantener el foco dentro del modal
      const focusables = ventana.querySelectorAll('button');
      const visibles = Array.prototype.filter.call(focusables, function (el) {
        return el.offsetParent !== null;
      });
      const primero = visibles[0];
      const ultimo = visibles[visibles.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  });

  // Deslizar con el dedo en móvil
  let inicioX = 0;
  escenario.addEventListener('touchstart', function (e) {
    inicioX = e.changedTouches[0].clientX;
  }, { passive: true });

  escenario.addEventListener('touchend', function (e) {
    if (fotos.length < 2) return;
    const diferencia = e.changedTouches[0].clientX - inicioX;
    if (Math.abs(diferencia) < 50) return;
    mostrar(diferencia < 0 ? indice + 1 : indice - 1);
  }, { passive: true });
})();
