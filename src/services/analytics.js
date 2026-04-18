import api from './api';

// Gera ou recupera sessionId único por visita
function getSessionId() {
  if (typeof window === 'undefined') return 'ssr';
  let sid = sessionStorage.getItem('rv_sid');
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('rv_sid', sid);
  }
  return sid;
}

export function trackPageview(tipo, produtoId = null) {
  try {
    const payload = {
      tipo,
      url: window.location.pathname,
      sessionId: getSessionId(),
      referrer: document.referrer || null,
    };
    if (produtoId) payload.produtoId = produtoId;
    api.post('/analytics/pageview', payload).catch(() => {});
  } catch {}
}

export function trackCarrinho(itens, total) {
  try {
    if (!itens || itens.length === 0) return;
    api.post('/analytics/carrinho', {
      sessionId: getSessionId(),
      itens: itens.map(i => ({
        produtoId: i.produtoId || i.id,
        nome: i.nome,
        quantidade: i.quantidade,
        preco: i.preco,
      })),
      total,
    }).catch(() => {});
  } catch {}
}

export function trackConversao() {
  try {
    api.put('/analytics/carrinho/convertido', { sessionId: getSessionId() }).catch(() => {});
  } catch {}
}
