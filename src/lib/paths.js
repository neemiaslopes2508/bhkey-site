// Caminhos relativos funcionais tanto no dev quanto na pasta local (file://).
// O build usa astro build.format = "file": a última URL vira .html na raiz,
// as anteriores viram diretórios. Ex.: /catalogo -> catalogo.html (raiz),
// /produto/<slug> -> produto/<slug>.html (1 nível). Logo:
//   profundidade = nº de segmentos da URL - 1  (mínimo 0)
export function prefixFor(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const depth = Math.max(0, segments.length - 1);
  return depth === 0 ? './' : '../'.repeat(depth);
}
