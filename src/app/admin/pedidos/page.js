'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import { BsSearch, BsX, BsChevronDown } from 'react-icons/bs';

const STATUS_OPTIONS = ['pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado'];

const STATUS_META = {
  pendente:   { label: 'Pendente',    color: '#f59e0b' },
  pago:       { label: 'Pago',        color: '#10b981' },
  preparando: { label: 'Preparando',  color: '#6366f1' },
  enviado:    { label: 'Enviado',     color: '#3b82f6' },
  entregue:   { label: 'Entregue',    color: '#059669' },
  cancelado:  { label: 'Cancelado',   color: '#ef4444' },
};

export default function PedidosPage() {
  const [pedidos,   setPedidos]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [detail,    setDetail]    = useState(null);
  const [updating,  setUpdating]  = useState(null);
  const [toast,     setToast]     = useState('');

  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filterSt) params.status = filterSt;
      if (search)   params.busca  = search;
      const res = await api.get('/pedidos', { params });
      const data = res.data;
      setPedidos(data.pedidos || data || []);
      setTotal(data.total ?? (data.pedidos ?? data).length);
    } catch { setPedidos([]); }
    finally { setLoading(false); }
  }, [page, filterSt, search]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleStatusChange = async (pedidoId, novoStatus) => {
    setUpdating(pedidoId);
    try {
      await api.put(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      showToast('Status atualizado!');
      load();
      if (detail?.id === pedidoId) setDetail(d => ({ ...d, status: novoStatus }));
    } catch { showToast('Erro ao atualizar status.'); }
    finally { setUpdating(null); }
  };

  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pedidos</h1>
          <p className={styles.pageSub}>{total} pedidos encontrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className={styles.searchBar}>
          <BsSearch className={styles.searchIcon}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por ID ou cliente..." className={styles.searchInput}/>
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}><BsX/></button>}
        </div>
        <select
          value={filterSt}
          onChange={e => { setFilterSt(e.target.value); setPage(1); }}
          style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e5e7eb', borderRadius: '4px', fontSize: '0.85rem', outline: 'none', background: 'white' }}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
      </div>

      <div className={styles.card}>
        {loading ? <p className={styles.loadingText}>Carregando...</p> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Total</th><th>Itens</th><th>Status</th><th>Data</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {pedidos.map(o => {
                  const st = STATUS_META[o.status] || { label: o.status, color: '#6b7280' };
                  return (
                    <tr key={o.id}>
                      <td className={styles.tdMono}>#{o.id}</td>
                      <td style={{ fontWeight: 500 }}>{o.usuario?.nome || o.cliente || '—'}</td>
                      <td style={{ fontWeight: 700, color: '#780e1a' }}>{fmt(o.total)}</td>
                      <td className={styles.tdMuted}>{o.itens?.length ?? o.totalItens ?? '—'}</td>
                      <td>
                        <span className={styles.badge} style={{ background: st.color + '20', color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className={styles.tdMuted}>{fmtDate(o.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button className={styles.btnSecondary} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => setDetail(o)}>
                            Detalhar
                          </button>
                          <div style={{ position: 'relative' }}>
                            <select
                              disabled={updating === o.id}
                              defaultValue=""
                              onChange={e => { if (e.target.value) handleStatusChange(o.id, e.target.value); }}
                              style={{ padding: '0.35rem 1.8rem 0.35rem 0.6rem', border: '1.5px solid #e5e7eb', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', appearance: 'none', background: 'white' }}
                            >
                              <option value="" disabled>Alterar status</option>
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s} disabled={s === o.status}>{STATUS_META[s]?.label || s}</option>
                              ))}
                            </select>
                            <BsChevronDown style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af', fontSize: '0.65rem' }}/>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pedidos.length === 0 && (
                  <tr><td colSpan={7} className={styles.empty}>Nenhum pedido encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Ant.</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Próx. →</button>
        </div>
      )}

      {/* Detalhe do pedido */}
      {detail && (
        <div className={styles.modalOverlay} onClick={() => setDetail(null)}>
          <div className={styles.modal} style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Pedido #{detail.id}</h2>
              <button className={styles.modalClose} onClick={() => setDetail(null)}><BsX size={20}/></button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 1rem' }}>
                <strong style={{ color: '#111827' }}>Cliente:</strong> {detail.usuario?.nome || '—'}<br/>
                <strong style={{ color: '#111827' }}>E-mail:</strong> {detail.usuario?.email || '—'}<br/>
                <strong style={{ color: '#111827' }}>Data:</strong> {fmtDate(detail.createdAt)}<br/>
                <strong style={{ color: '#111827' }}>Status:</strong>{' '}
                <span className={styles.badge} style={{ background: (STATUS_META[detail.status]?.color || '#6b7280') + '20', color: STATUS_META[detail.status]?.color || '#6b7280' }}>
                  {STATUS_META[detail.status]?.label || detail.status}
                </span>
              </p>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.75rem' }}>Itens</h3>
              {(detail.itens || []).map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.83rem' }}>
                  <span>{it.produto?.nome || it.nome || `Item ${i + 1}`}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(it.preco || it.precoUnitario)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>Total</span>
                <span style={{ color: '#780e1a' }}>{fmt(detail.total)}</span>
              </div>
              {detail.enderecoEntrega && (
                <>
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '1rem 0 0.5rem' }}>Endereço de entrega</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                    {detail.enderecoEntrega.rua}, {detail.enderecoEntrega.numero}<br/>
                    {detail.enderecoEntrega.cidade} — {detail.enderecoEntrega.estado}, {detail.enderecoEntrega.cep}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
