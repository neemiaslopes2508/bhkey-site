// ---------------------------------------------------------------------------
// Lista de pedidos da BH Key — fonte única do estado no navegador.
//
// Guarda apenas o necessário para reconstruir a linha (slug, código, nome,
// categoria, foto e quantidade). O preço não existe no site por definição:
// valor e disponibilidade são confirmados no atendimento.
//
// Persistência: localStorage. Se o navegador bloquear (modo privado antigo,
// file:// em alguns casos), a lista continua funcionando em memória durante a
// visita — nunca quebra a página.
// ---------------------------------------------------------------------------
import { linkWhatsApp, MENSAGEM_LISTA } from '../config/site.js';

const CHAVE = 'bhkey:lista:v1';
const MAX_QTD = 999;

let memoria = [];
let persistenciaOk = true;

try {
  const teste = '__bhkey_teste__';
  window.localStorage.setItem(teste, '1');
  window.localStorage.removeItem(teste);
} catch {
  persistenciaOk = false;
}

function sanear(itens) {
  if (!Array.isArray(itens)) return [];
  const vistos = new Set();
  const limpos = [];
  for (const bruto of itens) {
    if (!bruto || typeof bruto !== 'object') continue;
    const slug = String(bruto.slug || '').trim();
    const codigo = String(bruto.codigo || '').trim();
    const nome = String(bruto.nome || '').trim();
    if (!slug || !codigo || !nome || vistos.has(slug)) continue;
    const qtd = Math.min(MAX_QTD, Math.max(1, Number.parseInt(bruto.qtd, 10) || 1));
    vistos.add(slug);
    limpos.push({
      slug,
      codigo,
      nome,
      categoria: String(bruto.categoria || ''),
      img: String(bruto.img || ''),
      qtd,
    });
  }
  return limpos;
}

function lerDoDisco() {
  if (!persistenciaOk) return memoria;
  try {
    return sanear(JSON.parse(window.localStorage.getItem(CHAVE) || '[]'));
  } catch {
    return memoria;
  }
}

function emitir(itens) {
  document.dispatchEvent(new CustomEvent('bhkey:lista', { detail: itens }));
}

function gravar(itens) {
  const limpos = sanear(itens);
  memoria = limpos;
  if (persistenciaOk) {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(limpos));
    } catch {
      persistenciaOk = false;
    }
  }
  emitir(limpos);
  return limpos;
}

/* ------------------------------ leitura ---------------------------------- */

export function ler() {
  return lerDoDisco();
}

export function totalItens(itens = ler()) {
  return itens.reduce((soma, item) => soma + item.qtd, 0);
}

export function quantidadeDe(slug, itens = ler()) {
  const achado = itens.find((item) => item.slug === slug);
  return achado ? achado.qtd : 0;
}

/* ------------------------------ escrita ---------------------------------- */

export function adicionar(produto, qtd = 1) {
  const incremento = Math.min(MAX_QTD, Math.max(1, Number.parseInt(qtd, 10) || 1));
  const itens = ler();
  const achado = itens.find((item) => item.slug === produto.slug);
  if (achado) {
    achado.qtd = Math.min(MAX_QTD, achado.qtd + incremento);
  } else {
    itens.push({
      slug: String(produto.slug || ''),
      codigo: String(produto.codigo || ''),
      nome: String(produto.nome || ''),
      categoria: String(produto.categoria || ''),
      img: String(produto.img || ''),
      qtd: incremento,
    });
  }
  return gravar(itens);
}

export function definirQuantidade(slug, qtd) {
  const numero = Number.parseInt(qtd, 10);
  const itens = ler();
  const achado = itens.find((item) => item.slug === slug);
  if (!achado) return itens;
  if (!Number.isFinite(numero) || numero <= 0) {
    return gravar(itens.filter((item) => item.slug !== slug));
  }
  achado.qtd = Math.min(MAX_QTD, numero);
  return gravar(itens);
}

export function remover(slug) {
  return gravar(ler().filter((item) => item.slug !== slug));
}

export function limpar() {
  return gravar([]);
}

/* --------------------------- WhatsApp ------------------------------------ */

export function linkDaLista(itens = ler()) {
  if (itens.length === 0) return linkWhatsApp();
  return linkWhatsApp(MENSAGEM_LISTA(itens));
}

/* ----------------------------- eventos ----------------------------------- */

// Outra aba alterou a lista: espelha aqui também.
window.addEventListener('storage', (evento) => {
  if (evento.key !== CHAVE) return;
  emitir(lerDoDisco());
});

export const LIMITE_QTD = MAX_QTD;
