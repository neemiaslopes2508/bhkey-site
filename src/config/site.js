// ---------------------------------------------------------------------------
// ÚNICA FONTE DE CONFIGURAÇÃO DO SITE
// Troque APENAS os valores abaixo para atualizar o site inteiro.
// ---------------------------------------------------------------------------
//
// WHATSAPP: número em formato internacional SEM espaços, sinal + ou traços.
//           Brasil = 55 + DDD + número. VALOR ATUAL É PLACEHOLDER —
//           substituir pelo número real do cliente (ver PENDÊNCIAS.md).
//
export const WHATSAPP_NUMERO = '5531999999999';

// Texto padrão da mensagem pré-preenchida do WhatsApp (os links de produto
// acrescentam código e nome do item ao final).
export const WHATSAPP_MENSAGEM_PADRAO =
  'Olá! Vim pelo site da BH Key Distribuidora e gostaria de fazer um pedido.';

// Instagram oficial do cliente.
export const INSTAGRAM_URL = 'https://www.instagram.com/bhkey_distribuidora/';
export const INSTAGRAM_HANDLE = '@bhkey_distribuidora';

// Mapa: o endereço ainda é TBD, então o link abre a BUSCA do Google Maps
// pelo nome da empresa em vez de uma coordenada fixa.
export const MAPA_URL =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent('BHKEY Distribuidora');

// ---------------------------------------------------------------------------
// DADOS AINDA NÃO CONFIRMADOS PELO CLIENTE — mantidos como marcadores.
// NUNCA inventar valor: substituir quando o cliente informar.
// ---------------------------------------------------------------------------
export const ENDERECO = 'A definir';
export const HORARIO = 'A definir';
export const PEDIDO_MINIMO = 'A definir';

// Monta o link wa.me com mensagem pré-preenchida.
export function linkWhatsApp(mensagem = WHATSAPP_MENSAGEM_PADRAO) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

// Mensagem de pedido de um item específico (código + nome), usada pelos cards
// e pela página de produto.
export function MENSAGEM_PRODUTO(codigo, nome) {
  return `Olá! Vim pelo site da BH Key Distribuidora e tenho interesse no item ${codigo} — ${nome}. Pode me passar disponibilidade e valor?`;
}
