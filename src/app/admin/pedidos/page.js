'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import pedStyles from './pedidos.module.css';
import {
  BsSearch, BsX, BsChevronDown, BsChevronUp,
  BsArrowRepeat, BsBoxSeam, BsPerson, BsGeoAlt, BsTag,
} from 'react-icons/bs';

const STATUS_OPTIONS = ['pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado'];

const STATUS_META = {
  pendente:   { label: 'Pendente',   color: '#f59e0b', bg: '#fef3c7' },
  pago:       { label: 'Pago',       color: '#10b981', bg: '#d1fae5' },
  preparando: { label: 'Preparando', color: '#6366f1', bg: '#ede9fe' },
  enviado:    { label: 'Enviado',    color: '#3b82f6', bg: '#dbeafe' },
  entregue:   { label: 'Entregue',   color: '#059669', bg: '#d1fae5' },
  cancelado:  { label: 'Cancelado',  color: '#ef4444', bg: '#fee2e2' },
};

const fmt    = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function PedidosPage() {
  const [pedidos,   setPedidos]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);   // id do pedido aberto
  const [details,   setDetails]   = useState({});     // cache de detalhes por id
  const [updating,  setUpdating]  = useState(null);
  const [syncing,   setSyncing]   = useState(null);
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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Abre/fecha uma linha; ao abrir, carrega detalhes completos se não tiver em cache
  const toggleExpand = async (o) => {
    if (expanded === o.id) { setExpanded(null); return; }
    setExpanded(o.id);
    if (!details[o.id]) {
      try {
        const r = await api.get(`/pedidos/${o.id}`);
        setDetails(prev => ({ ...prev, [o.id]: r.data }));
      } catch {
        setDetails(prev => ({ ...prev, [o.id]: o })); // fallback para os dados da lista
      }
    }
  };

  const handleStatusChange = async (pedidoId, novoStatus) => {
    setUpdating(pedidoId);
    try {
      await api.put(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      showToast('Status atualizado!');
      setPedidos(ps => ps.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
      setDetails(prev => prev[pedidoId] ? { ...prev, [pedidoId]: { ...prev[pedidoId], status: novoStatus } } : prev);
    } catch { showToast('Erro ao atualizar status.'); }
    finally { setUpdating(null); }
  };

  const handleSync = async (pedidoId) => {
    setSyncing(pedidoId);
    try {
      const r = await api.post(`/pagamentos/admin/sync/${pedidoId}`);
      showToast(`Pagamento sincronizado: ${STATUS_META[r.data.status]?.label || r.data.status}`);
      load(); // recarrega a lista
      setDetails(prev => { const n = { ...prev }; delete n[pedidoId]; return n; }); // limpa cache do detalhe
    } catch { showToast('Erro ao sincronizar pagamento.'); }
    finally { setSyncing(null); }
  };

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
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div className={styles.searchBar}>
          <BsSearch className={styles.searchIcon}/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por ID ou cliente..."
            className={styles.searchInput}
          />
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}><BsX/></button>}
        </div>
        <select
          value={filterSt}
          onChange={e => { setFilterSt(e.target.value); setPage(1); }}
          className={pedStyles.statusFilter}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
      </div>

      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <p className={styles.loadingText} style={{ padding: '2rem' }}>Carregando...</p> : (
          <div>
            {pedidos.length === 0 && (
              <p className={styles.empty} style={{ padding: '2rem' }}>Nenhum pedido encontrado.</p>
            )}

            {pedidos.map(o => {
              const st  = STATUS_META[o.status] || { label: o.status, color: '#6b7280', bg: '#f3f4f6' };
              const det = details[o.id];
              const open = expanded === o.id;

              return (
                <div key={o.id} className={`${pedStyles.row} ${open ? pedStyles.rowOpen : ''}`}>

                  {/* ── Linha principal (clicável) ── */}
                  <div className={pedStyles.rowHeader} onClick={() => toggleExpand(o)}>
                    <div className={pedStyles.rowLeft}>
                      <span className={pedStyles.orderId}>#{o.id}</span>
                      <div className={pedStyles.orderInfo}>
                        <span className={pedStyles.orderClient}>{o.usuario?.nome || o.cliente || '—'}</span>
                        <span className={pedStyles.orderDate}>{fmtDate(o.createdAt)}</span>
                      </div>
                    </div>

                    <div className={pedStyles.rowRight}>
                      <span className={pedStyles.orderTotal}>{fmt(o.total)}</span>
                      <span className={pedStyles.badge} style={{ color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                      <span className={pedStyles.itemCount}>{o.itens?.length ?? o.totalItens ?? 0} iten{(o.itens?.length ?? 0) !== 1 ? 's' : ''}</span>
                      {open ? <BsChevronUp className={pedStyles.chevron}/> : <BsChevronDown className={pedStyles.chevron}/>}
                    </div>
                  </div>

                  {/* ── Painel expansível ── */}
                  {open && (
                    <div className={pedStyles.rowBody}>
                      {!det ? (
                        <p className={pedStyles.detailLoading}>Carregando detalhes…</p>
                      ) : (
                        <div className={pedStyles.detailGrid}>

                          {/* Cliente */}
                          <div className={pedStyles.detailBlock}>
                            <h4><BsPerson size={13}/> Cliente</h4>
                            <p>{det.usuario?.nome || '—'}</p>
                            <p className={pedStyles.muted}>{det.usuario?.email || '—'}</p>
                            <p className={pedStyles.muted}>{det.usuario?.telefone || ''}</p>
                          </div>

                          {/* Endereço */}
                          {det.enderecoEntrega && (
                            <div className={pedStyles.detailBlock}>
                              <h4><BsGeoAlt size={13}/> Entrega</h4>
                              <p>{det.enderecoEntrega.rua}, {det.enderecoEntrega.numero}</p>
                              <p className={pedStyles.muted}>{det.enderecoEntrega.bairro && `${det.enderecoEntrega.bairro} — `}{det.enderecoEntrega.cidade}/{det.enderecoEntrega.estado}</p>
                              <p className={pedStyles.muted}>CEP {det.enderecoEntrega.cep}</p>
                            </div>
                          )}

                          {/* Frete */}
                          {det.dadosFrete && (
                            <div className={pedStyles.detailBlock}>
                              <h4><BsBoxSeam size={13}/> Frete</h4>
                              <p>{det.dadosFrete.name || det.dadosFrete.carrier || '—'}</p>
                              <p className={pedStyles.muted}>{fmt(det.valorFrete)} · {det.dadosFrete.delivery_time ?? '—'}d úteis</p>
                            </div>
                          )}

                          {/* Cupom */}
                          {det.cupom && (
                            <div className={pedStyles.detailBlock}>
                              <h4><BsTag size={13}/> Cupom</h4>
                              <p>{det.cupom.codigo}</p>
                              <p className={pedStyles.muted}>Desconto: {fmt(det.desconto)}</p>
                            </div>
                          )}

                          {/* Itens — full width */}
                          <div className={`${pedStyles.detailBlock} ${pedStyles.detailBlockFull}`}>
                            <h4><BsBoxSeam size={13}/> Itens do pedido</h4>
                            <div className={pedStyles.itemsTable}>
                              {(det.itens || []).map((it, i) => (
                                <div key={i} className={pedStyles.itemRow}>
                                  <span className={pedStyles.itemName}>
                                    {it.produto?.nome || it.nome || `Item ${i + 1}`}
                                    {it.variacao && <em className={pedStyles.muted}> · {it.variacao.nome || it.variacao}</em>}
                                  </span>
                                  <span className={pedStyles.itemQty}>×{it.quantidade}</span>
                                  <span className={pedStyles.itemPrice}>{fmt(it.preco || it.precoUnitario)}</span>
                                </div>
                              ))}
                              {(det.valorFrete > 0) && (
                                <div className={`${pedStyles.itemRow} ${pedStyles.itemFrete}`}>
                                  <span className={pedStyles.itemName}>Frete</span>
                                  <span className={pedStyles.itemQty}></span>
                                  <span className={pedStyles.itemPrice}>{fmt(det.valorFrete)}</span>
                                </div>
                              )}
                              <div className={`${pedStyles.itemRow} ${pedStyles.itemTotal}`}>
                                <span className={pedStyles.itemName}>Total</span>
                                <span className={pedStyles.itemQty}></span>
                                <span className={pedStyles.itemPrice}>{fmt(det.total)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className={`${pedStyles.detailBlock} ${pedStyles.detailBlockFull} ${pedStyles.detailActions}`}>
                            {/* Alterar status */}
                            <div className={pedStyles.actionGroup}>
                              <label>Alterar status</label>
                              <select
                                value={det.status}
                                disabled={updating === o.id}
                                onChange={e => handleStatusChange(o.id, e.target.value)}
                                className={pedStyles.statusSelect}
                              >
                                {STATUS_OPTIONS.map(s => (
                                  <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                                ))}
                              </select>
                            </div>

                            {/* Sincronizar pagamento MP */}
                            <button
                              className={pedStyles.syncBtn}
                              disabled={syncing === o.id}
                              onClick={() => handleSync(o.id)}
                              title="Consulta o MercadoPago e atualiza o status de pagamento"
                            >
                              <BsArrowRepeat className={syncing === o.id ? pedStyles.spinning : ''}/>
                              {syncing === o.id ? 'Sincronizando…' : 'Sync pagamento'}
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
    </div>
  );
}
