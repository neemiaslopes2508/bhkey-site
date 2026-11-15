// BH Key — interações do site (empacotado com esbuild em public/app.js).
// 1. menu mobile   2. lista de pedidos (gaveta, barra, contador, WhatsApp)
// 3. filtro + busca do catálogo   4. passos de quantidade   5. carrossel.
// Sem animação de entrada: a página é legível desde o primeiro frame e
// prefers-reduced-motion é respeitado no CSS.
import createEmblaCarousel from 'embla-carousel';
import {
  ler,
  adicionar,
  definirQuantidade,
  remover,
  limpar,
  totalItens,
  quantidadeDe,
  linkDaLista,
  LIMITE_QTD,
} from './lista.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefixo = document.body.dataset.prefix || './';

const textoQtd = (n) => (n === 1 ? '1 item' : `${n} itens`);
const limitarQtd = (n) => Math.min(LIMITE_QTD, Math.max(1, Number.parseInt(n, 10) || 1));

/* ---------- menu mobile ---------- */
const toggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu-mobile');

function fecharMenu() {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', 'false');
  menu.classList.add('hidden');
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('hidden', open);
  });
  // Esc fecha o menu e devolve o foco ao botão que o abriu.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    fecharMenu();
    toggle.focus();
  });
}

/* =========================================================================
   LISTA DE PEDIDOS
   ========================================================================= */
const listaRaiz = document.getElementById('lista-raiz');
const listaPainel = document.getElementById('lista-painel');
const listaItens = document.getElementById('lista-itens');
const listaVazia = document.getElementById('lista-vazia');
const listaRodape = document.getElementById('lista-rodape');
const listaTituloQtd = document.getElementById('lista-titulo-qtd');
const listaTotalQtd = document.getElementById('lista-total-qtd');
const listaTotalUnidade = document.getElementById('lista-total-unidade');
const listaWhats = document.getElementById('lista-whatsapp');
const listaBarra = document.getElementById('lista-barra');
const listaBarraQtd = document.getElementById('lista-barra-qtd');
const listaToast = document.getElementById('lista-toast');
const listaToastTexto = document.getElementById('lista-toast-texto');
const listaToastAcao = listaToast ? listaToast.querySelector('.lista-toast-acao') : null;
const listaBotaoLimpar = document.getElementById('lista-limpar');
const listaTextoLimpar = listaBotaoLimpar
  ? listaBotaoLimpar.querySelector('[data-limpar-texto]')
  : null;

let listaAberta = false;
let ultimoFoco = null;
let toastTimer = null;
let limparArmado = false;
let limparTimer = null;

/* ---------- desenho da lista ---------- */
function criar(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function desenharItens(itens) {
  if (!listaItens) return;
  listaItens.replaceChildren();
  for (const item of itens) {
    const li = criar('li', 'lista-item');

    const linkFoto = criar('a', 'lista-item-foto');
    linkFoto.href = `${prefixo}produto/${item.slug}.html`;
    linkFoto.tabIndex = -1;
    linkFoto.setAttribute('aria-hidden', 'true');
    if (item.img) {
      const img = document.createElement('img');
      img.src = `${prefixo}${item.img}`;
      img.alt = '';
      img.width = 76;
      img.height = 76;
      img.loading = 'lazy';
      img.decoding = 'async';
      linkFoto.append(img);
    }
    li.append(linkFoto);

    const corpo = criar('div', 'lista-item-corpo');
    const topo = criar('div', 'lista-item-topo');
    topo.append(criar('span', 'label-caps text-green', item.codigo));
    const removerBtn = criar('button', 'lista-remover');
    removerBtn.type = 'button';
    removerBtn.dataset.acao = 'remover';
    removerBtn.dataset.slug = item.slug;
    removerBtn.setAttribute('aria-label', `Remover ${item.nome} da lista`);
    removerBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>';
    topo.append(removerBtn);
    corpo.append(topo);

    const nome = criar('a', 'lista-item-nome', item.nome);
    nome.href = `${prefixo}produto/${item.slug}.html`;
    corpo.append(nome);

    const rodape = criar('div', 'lista-item-rodape');
    const stepper = criar('div', 'stepper stepper--lista');
    const menos = criar('button', 'stepper-btn');
    menos.type = 'button';
    menos.dataset.acao = 'menos';
    menos.dataset.slug = item.slug;
    menos.setAttribute('aria-label', `Diminuir a quantidade de ${item.nome}`);
    menos.disabled = item.qtd <= 1;
    menos.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
    const valor = criar('span', 'stepper-valor', String(item.qtd));
    valor.setAttribute('aria-live', 'polite');
    const mais = criar('button', 'stepper-btn');
    mais.type = 'button';
    mais.dataset.acao = 'mais';
    mais.dataset.slug = item.slug;
    mais.setAttribute('aria-label', `Aumentar a quantidade de ${item.nome}`);
    mais.disabled = item.qtd >= LIMITE_QTD;
    mais.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    stepper.append(menos, valor, mais);

    const qtdRotulo = criar('span', 'lista-item-qtd-rotulo', 'Quantidade');
    rodape.append(qtdRotulo, stepper);
    corpo.append(rodape);
    li.append(corpo);
    listaItens.append(li);
  }
}

function atualizarBotoesAdicionar(itens) {
  document.querySelectorAll('[data-add]').forEach((botao) => {
    const qtd = quantidadeDe(botao.dataset.slug, itens);
    botao.classList.toggle('esta-na-lista', qtd > 0);
    const rotulo = botao.querySelector('[data-add-texto]');
    if (rotulo) rotulo.textContent = qtd > 0 ? 'Na lista' : 'Adicionar à lista';
    const contador = botao.querySelector('[data-add-contador]');
    if (contador) {
      contador.hidden = qtd === 0;
      contador.textContent = String(qtd);
    }
    const nome = botao.dataset.nome || 'este item';
    botao.setAttribute(
      'aria-label',
      qtd > 0
        ? `Adicionar mais ${nome}. ${qtd} na lista`
        : `Adicionar ${nome} à lista`
    );
  });
}

function desenhar() {
  const itens = ler();
  const total = totalItens(itens);

  document.querySelectorAll('[data-lista-contador]').forEach((el) => {
    el.textContent = String(total);
    el.hidden = total === 0;
  });
  document.querySelectorAll('[data-lista-abrir]').forEach((el) => {
    if (el.classList.contains('btn-lista')) {
      el.setAttribute(
        'aria-label',
        total === 0 ? 'Abrir minha lista, vazia' : `Abrir minha lista, ${textoQtd(total)}`
      );
    }
  });

  if (listaTituloQtd) listaTituloQtd.textContent = String(total);
  if (listaTotalQtd) listaTotalQtd.textContent = String(total);
  if (listaTotalUnidade && listaTotalQtd) {
    listaTotalUnidade.textContent = total === 1 ? 'item' : 'itens';
  }
  if (listaBarraQtd) listaBarraQtd.textContent = textoQtd(total);

  const vazio = itens.length === 0;
  if (listaVazia) listaVazia.hidden = !vazio;
  if (listaItens) listaItens.hidden = vazio;
  if (listaRodape) listaRodape.hidden = vazio;

  if (listaWhats) listaWhats.href = linkDaLista(itens);

  desenharItens(itens);
  atualizarBotoesAdicionar(itens);

  const mostrarBarra = !vazio && !listaAberta;
  if (listaBarra) listaBarra.hidden = !mostrarBarra;
  document.body.classList.toggle('tem-barra-lista', mostrarBarra);
  document.body.classList.toggle('lista-aberta', listaAberta);
}

/* ---------- abrir / fechar ---------- */
function focaveisDaLista() {
  if (!listaPainel) return [];
  return Array.from(
    listaPainel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);
}

function abrirLista() {
  if (!listaRaiz || listaAberta) return;
  fecharMenu();
  if (listaToast) listaToast.hidden = true;
  ultimoFoco = document.activeElement;
  listaAberta = true;
  listaRaiz.removeAttribute('inert');
  listaRaiz.setAttribute('aria-hidden', 'false');
  listaRaiz.classList.add('aberta');
  desenhar();
  // Espera a folha ficar visível para levar o foco sem rolar a página.
  requestAnimationFrame(() => {
    if (listaPainel) listaPainel.focus({ preventScroll: true });
  });
}

function fecharLista() {
  if (!listaRaiz || !listaAberta) return;
  // Devolve o foco antes de esconder: evita manter o foco dentro de um
  // elemento aria-hidden (o leitor de tela perderia a posição).
  const destino =
    ultimoFoco && ultimoFoco.offsetParent !== null
      ? ultimoFoco
      : document.querySelector('.btn-lista');
  if (destino && typeof destino.focus === 'function') {
    destino.focus({ preventScroll: true });
  }
  listaAberta = false;
  listaRaiz.classList.remove('aberta');
  listaRaiz.setAttribute('aria-hidden', 'true');
  listaRaiz.setAttribute('inert', '');
  desenhar();
}

if (listaRaiz) {
  document.addEventListener('click', (e) => {
    const abrir = e.target.closest('[data-lista-abrir]');
    if (abrir) {
      e.preventDefault();
      abrirLista();
      return;
    }
    const fechar = e.target.closest('[data-lista-fechar]');
    if (fechar) {
      const ehLink = fechar.tagName === 'A' && fechar.getAttribute('href');
      fecharLista();
      if (ehLink) return; // fecha e deixa o link navegar
      e.preventDefault();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!listaAberta) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      fecharLista();
      return;
    }
    if (e.key !== 'Tab') return;
    const focaveis = focaveisDaLista();
    if (focaveis.length === 0) return;
    const primeiro = focaveis[0];
    const derradeiro = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      derradeiro.focus();
    } else if (!e.shiftKey && document.activeElement === derradeiro) {
      e.preventDefault();
      primeiro.focus();
    }
  });
}

/* ---------- ações dentro da lista ---------- */
if (listaItens) {
  listaItens.addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-acao]');
    if (!botao) return;
    const { acao, slug } = botao.dataset;
    if (acao === 'mais') {
      definirQuantidade(slug, quantidadeDe(slug) + 1);
      const novo = listaItens.querySelector(`button[data-acao="mais"][data-slug="${slug}"]`);
      if (novo) novo.focus();
    } else if (acao === 'menos') {
      definirQuantidade(slug, quantidadeDe(slug) - 1);
      const novo = listaItens.querySelector(`button[data-acao="menos"][data-slug="${slug}"]`);
      if (novo) novo.focus();
    } else if (acao === 'remover') {
      const item = ler().find((i) => i.slug === slug);
      remover(slug);
      avisar(item ? `${item.nome} saiu da lista.` : 'Item removido da lista.');
      const proximo = listaItens.querySelector('button[data-acao="remover"]');
      if (proximo) proximo.focus();
      else if (listaPainel) listaPainel.focus();
    }
  });
}

/* ---------- limpar: dois toques, sem confirm() do navegador ---------- */
function desarmarLimpar() {
  limparArmado = false;
  if (limparTimer) window.clearTimeout(limparTimer);
  if (listaBotaoLimpar) listaBotaoLimpar.classList.remove('esta-armado');
  if (listaTextoLimpar) listaTextoLimpar.textContent = 'Limpar lista';
}

if (listaBotaoLimpar) {
  listaBotaoLimpar.addEventListener('click', () => {
    if (!limparArmado) {
      limparArmado = true;
      listaBotaoLimpar.classList.add('esta-armado');
      if (listaTextoLimpar) listaTextoLimpar.textContent = 'Confirmar limpeza';
      limparTimer = window.setTimeout(desarmarLimpar, 4000);
      return;
    }
    const tinha = ler().length;
    limpar();
    desarmarLimpar();
    if (listaPainel) listaPainel.focus({ preventScroll: true });
    if (tinha > 0) avisar('Lista limpa.');
  });
}

/* ---------- aviso flutuante ---------- */
function avisar(mensagem, comAcao = false) {
  if (!listaToast || !listaToastTexto) return;
  listaToastTexto.textContent = mensagem;
  if (listaToastAcao) listaToastAcao.hidden = !comAcao;
  listaToast.hidden = false;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    listaToast.hidden = true;
  }, 4200);
}

if (listaToastAcao) {
  listaToastAcao.addEventListener('click', () => {
    listaToast.hidden = true;
  });
}

/* ---------- adicionar (cards, produto, destaques) ---------- */
document.addEventListener('click', (e) => {
  const botao = e.target.closest('[data-add]');
  if (!botao) return;
  e.preventDefault();

  const origemQtd = botao.dataset.qtdOrigem
    ? document.getElementById(botao.dataset.qtdOrigem)
    : null;
  const qtd = origemQtd ? limitarQtd(origemQtd.value) : 1;

  const produto = {
    slug: botao.dataset.slug,
    codigo: botao.dataset.codigo,
    nome: botao.dataset.nome,
    categoria: botao.dataset.categoria,
    img: botao.dataset.img,
  };
  if (!produto.slug) return;

  adicionar(produto, qtd);
  botao.classList.add('acabou-de-adicionar');
  window.setTimeout(() => botao.classList.remove('acabou-de-adicionar'), 450);
  avisar(
    qtd > 1 ? `${qtd} itens na lista: ${produto.nome}` : `${produto.nome} na lista.`,
    true
  );
});

document.addEventListener('bhkey:lista', desenhar);

/* ---------- passos de quantidade (página do produto) ---------- */
document.querySelectorAll('[data-stepper]').forEach((stepper) => {
  const campo = stepper.querySelector('input');
  if (!campo) return;
  const menos = stepper.querySelector('[data-menos]');
  const mais = stepper.querySelector('[data-mais]');

  const definir = (valor) => {
    campo.value = String(limitarQtd(valor));
    if (menos) menos.disabled = Number(campo.value) <= 1;
    if (mais) mais.disabled = Number(campo.value) >= LIMITE_QTD;
  };

  if (menos) menos.addEventListener('click', () => definir(Number(campo.value) - 1));
  if (mais) mais.addEventListener('click', () => definir(Number(campo.value) + 1));
  campo.addEventListener('change', () => definir(campo.value));
  campo.addEventListener('blur', () => definir(campo.value));
  definir(campo.value);
});

/* ---------- catálogo: filtro por categoria + busca por nome/código ---------- */
const grid = document.getElementById('catalogo-grid');
if (grid) {
  const cards = Array.from(grid.querySelectorAll('[data-produto]'));
  const chips = Array.from(document.querySelectorAll('[data-filtro]'));
  const input = document.getElementById('catalogo-busca');
  const limparBusca = document.getElementById('catalogo-limpar');
  const counter = document.getElementById('catalogo-contador');
  const empty = document.getElementById('catalogo-vazio');
  const params = new URLSearchParams(window.location.search);
  let categoria = params.get('cat') || 'todos';
  let termo = params.get('q') || '';
  if (input && termo) input.value = termo;

  const normalize = (s) =>
    String(s)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  // Compara também sem hífen, espaço e pontuação: "bkcv101" acha "BK-CV-101".
  const compacto = (s) => normalize(s).replace(/[^a-z0-9]/g, '');

  function aplicar() {
    const t = normalize(termo.trim());
    const tCompacto = compacto(termo.trim());
    let visiveis = 0;
    for (const card of cards) {
      const okCat = categoria === 'todos' || card.dataset.categoria === categoria;
      const alvo = normalize(`${card.dataset.nome} ${card.dataset.codigo}`);
      const alvoCompacto = compacto(`${card.dataset.nome} ${card.dataset.codigo}`);
      const okBusca =
        t === '' || alvo.includes(t) || (tCompacto !== '' && alvoCompacto.includes(tCompacto));
      const show = okCat && okBusca;
      card.classList.toggle('hidden', !show);
      if (show) visiveis++;
    }
    if (counter) {
      counter.textContent = visiveis === cards.length
        ? `${visiveis} ${visiveis === 1 ? 'item' : 'itens'}`
        : `${visiveis} de ${cards.length} itens`;
    }
    if (empty) empty.classList.toggle('hidden', visiveis > 0);
    if (limparBusca) limparBusca.hidden = termo.length === 0;
    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.filtro === categoria));
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
    input.addEventListener('search', () => {
      termo = input.value;
      aplicar();
    });
  }
  if (limparBusca) {
    limparBusca.addEventListener('click', () => {
      termo = '';
      if (input) {
        input.value = '';
        input.focus();
      }
      aplicar();
    });
  }
  aplicar();
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

/* ---------- primeira pintura ---------- */
desenhar();
