// BH Key — interações do site (empacotado com esbuild em public/app.js).
// 1. menu mobile  2. filtro de categoria + busca no catálogo  3. micro-animais (motion)
// 4. carrossel de destaques (Embla)
import { animate } from 'motion';
import createEmblaCarousel from 'embla-carousel';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- menu mobile ---------- */
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-mobile');
if (toggle && menu) {
  const fechar = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.add('hidden');
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('hidden', open);
  });
  // Esc fecha o menu e devolve o foco ao botão que o abriu.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    fechar();
    toggle.focus();
  });
}

/* ---------- catálogo: filtro por categoria + busca por nome/código ---------- */
const grid = document.getElementById('catalogo-grid');
if (grid) {
  const cards = Array.from(grid.querySelectorAll('[data-produto]'));
  const chips = Array.from(document.querySelectorAll('[data-filtro]'));
  const input = document.getElementById('catalogo-busca');
  const counter = document.getElementById('catalogo-contador');
  const empty = document.getElementById('catalogo-vazio');
  const params = new URLSearchParams(window.location.search);
  let categoria = params.get('cat') || 'todos';
  let termo = params.get('q') || '';
  if (input && termo) input.value = termo;

  const normalize = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function aplicar() {
    const t = normalize(termo.trim());
    let visiveis = 0;
    for (const card of cards) {
      const okCat = categoria === 'todos' || card.dataset.categoria === categoria;
      const alvo = normalize(`${card.dataset.nome} ${card.dataset.codigo}`);
      const okBusca = t === '' || alvo.includes(t);
      const show = okCat && okBusca;
      card.classList.toggle('hidden', !show);
      if (show) visiveis++;
    }
    if (counter) {
      counter.textContent = visiveis === cards.length
        ? `${visiveis} itens`
        : `${visiveis} de ${cards.length} itens`;
    }
    if (empty) empty.classList.toggle('hidden', visiveis > 0);
    chips.forEach((chip) => {
      const active = chip.dataset.filtro === categoria;
      chip.setAttribute('aria-pressed', String(active));
      chip.classList.toggle('bg-green', active);
      chip.classList.toggle('text-ink', active);
      chip.classList.toggle('text-paper/75', !active);
    });
    sincronizarURL();
  }

  // O endereço acompanha o filtro e a busca, para dar para compartilhar a lista.
  function sincronizarURL() {
    try {
      const url = new URL(window.location.href);
      if (categoria === 'todos') url.searchParams.delete('cat');
      else url.searchParams.set('cat', categoria);
      if (termo.trim()) url.searchParams.set('q', termo);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    } catch {
      // Alguns navegadores bloqueiam isso em file://; o filtro segue funcionando.
    }
  }

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      categoria = chip.dataset.filtro;
      aplicar();
    })
  );
  if (input) {
    input.addEventListener('input', () => {
      termo = input.value;
      aplicar();
    });
  }
  aplicar();
}

/* ---------- micro-animais: entrada discreta de seções ---------- */
if (!reduceMotion) {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    animate(
      el,
      { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
      { duration: 0.45, easing: [0.22, 1, 0.36, 1] }
    );
  });
  // hover sutil nos cards do catálogo
  document.querySelectorAll('[data-produto]').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      animate(card, { transform: 'translateY(-3px)' }, { duration: 0.18 });
    });
    card.addEventListener('mouseleave', () => {
      animate(card, { transform: 'translateY(0)' }, { duration: 0.18 });
    });
  });
}

/* ---------- carrossel de destaques (Embla) ----------
   Sem JS a faixa continua rolando na mão (overflow-x nativo); com JS o
   Embla assume, com setas e estado de botão desabilitado. */
document.querySelectorAll('[data-embla-viewport]').forEach((viewport) => {
  const secao = viewport.closest('section');
  const anterior = secao ? secao.querySelector('[data-embla-prev]') : null;
  const proximo = secao ? secao.querySelector('[data-embla-next]') : null;

  // Com JS a faixa fica overflow:hidden e o Embla move o conteúdo por
  // transform. Sem JS (ou se algo falhar) ela volta a rolar na mão.
  viewport.style.overflowX = 'hidden';

  let api;
  try {
    api = createEmblaCarousel(viewport, {
      align: 'start',
      loop: false,
      duration: reduceMotion ? 0 : 25,
    });
  } catch {
    viewport.style.overflowX = 'auto';
    return;
  }

  const sincronizar = () => {
    if (anterior) anterior.disabled = !api.canScrollPrev();
    if (proximo) proximo.disabled = !api.canScrollNext();
  };
  api.on('select', sincronizar);
  api.on('reInit', sincronizar);
  sincronizar();

  if (anterior) anterior.addEventListener('click', () => api.scrollPrev());
  if (proximo) proximo.addEventListener('click', () => api.scrollNext());
});
