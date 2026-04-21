'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import p from './pedidos.module.css';
import ord from '@/components/AccountPage/OrderHistory.module.css';
import Image from 'next/image';
import {
  BsSearch, BsX, BsChevronDown, BsChevronUp,
  BsArrowRepeat, BsBoxSeam, BsPerson, BsGeoAlt, BsTag, BsTruck,
  BsCheckCircleFill, BsClockFill, BsCreditCard2FrontFill,
  BsGearFill, BsHouseCheckFill, BsXCircleFill, BsPencil, BsCheckLg,
} from 'react-icons/bs';

// ── Stepper ───────────────────────────────────────────────────────────────────
const STEPS = [
  { key: 'criado',     label: 'Pedido Criado',       icon: BsCheckCircleFill      },
  { key: 'pendente',   label: 'Aguardando Pagto.',    icon: BsClockFill            },
  { key: 'pago',       label: 'Pag. Confirmado',      icon: BsCreditCard2FrontFill },
  { key: 'preparando', label: 'Em Preparação',        icon: BsGearFill             },
  { key: 'enviado',    label: 'Enviado',              icon: BsTruck                },
  { key: 'entregue',   label: 'Entregue',             icon: BsHouseCheckFill       },
];

const STATUS_STEP = { pendente:1, pago:2, preparando:3, enviado:4, entregue:5, cancelado:-1 };

const STATUS_OPTIONS = ['pendente', 'pago', 'preparando', 'enviado', 'entregue', 'cancelado'];

const STATUS_META = {
  pendente:   { label: 'Pendente',   color: '#92400e', bg: '#fef3c7' },
  pago:       { label: 'Pago',       color: '#065f46', bg: '#d1fae5' },
  preparando: { label: 'Preparando', color: '#4c1d95', bg: '#ede9fe' },
  enviado:    { label: 'Enviado',    color: '#1e40af', bg: '#dbeafe' },
  entregue:   { label: 'Entregue',   color: '#065f46', bg: '#d1fae5' },
  cancelado:  { label: 'Cancelado',  color: '#991b1b', bg: '#fee2e2' },
};

const fmt     = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

// ── Component ─────────────────────────────────────────────────────────────────
export default function PedidosPage() {
  const [pedidos,   setPedidos]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [details,   setDetails]   = useState({});
  const [updating,  setUpdating]  = useState(null);
  const [syncing,   setSyncing]   = useState(null);
  const [tracking,  setTracking]  = useState({});   // { [pedidoId]: string }
  const [savingTrack, setSavingTrack] = useState(null);
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

  const toggleExpand = async (o) => {
    if (expanded === o.id) { setExpanded(null); return; }
    setExpanded(o.id);
    if (!details[o.id]) {
      try {
        const r = await api.get(`/pedidos/${o.id}`);
        const det = r.data;
        setDetails(prev => ({ ...prev, [o.id]: det }));
        // Pre-fill tracking input with current code
        if (det.dadosFrete?.codigoRastreio) {
          setTracking(prev => ({ ...prev, [o.id]: det.dadosFrete.codigoRastreio }));
        }
      } catch {
        setDetails(prev => ({ ...prev, [o.id]: o }));
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
    } catch (err) {
      const msg = err?.response?.data?.erro || err?.response?.data?.message || err?.message || 'Erro ao atualizar status.';
      console.error('[Admin Pedidos] Erro ao atualizar status:', err?.response?.status, msg);
      showToast(`Erro: ${msg}`);
    }
    finally { setUpdating(null); }
  };

  const handleSync = async (pedidoId) => {
    setSyncing(pedidoId);
    try {
      const r = await api.post(`/pagamentos/admin/sync/${pedidoId}`);
      showToast(`Pagamento sincronizado: ${STATUS_META[r.data.status]?.label || r.data.status}`);
      load();
      setDetails(prev => { const n = { ...prev }; delete n[pedidoId]; return n; });
    } catch { showToast('Erro ao sincronizar pagamento.'); }
    finally { setSyncing(null); }
  };

  const handleSaveTracking = async (pedidoId) => {
    setSavingTrack(pedidoId);
    try {
      await api.put(`/pedidos/${pedidoId}/rastreio`, { codigoRastreio: tracking[pedidoId] || '' });
      showToast('Código de rastreio salvo!');
      setDetails(prev => prev[pedidoId] ? {
        ...prev,
        [pedidoId]: {
          ...prev[pedidoId],
          dadosFrete: { ...prev[pedidoId].dadosFrete, codigoRastreio: tracking[pedidoId] },
        },
      } : prev);
    } catch { showToast('Erro ao salvar rastreio.'); }
    finally { setSavingTrack(null); }
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
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por ID ou cliente..." className={styles.searchInput}/>
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}><BsX/></button>}
        </div>
        <select value={filterSt} onChange={e => { setFilterSt(e.target.value); setPage(1); }} className={p.statusFilter}>
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <p className={styles.loadingText}>Carregando...</p>
      ) : (
        <div className={ord.orderList}>
          {pedidos.length === 0 && <p className={styles.empty}>Nenhum pedido encontrado.</p>}

          {pedidos.map(o => {
            const stepIdx    = STATUS_STEP[o.status] ?? 1;
            const isCancelled = o.status === 'cancelado';
            const det         = details[o.id];
            const isOpen      = expanded === o.id;
            const st          = STATUS_META[o.status] || { label: o.status, color: '#6b7280', bg: '#f3f4f6' };

            return (
              <div key={o.id} className={`${ord.orderCard} ${isOpen ? ord.orderCardOpen : ''}`}>

                {/* ── Header row ── */}
                <div className={ord.orderCardHead} onClick={() => toggleExpand(o)}>
                  <div className={ord.orderCardHeadLeft}>
                    <span className={`${ord.orderId} ${p.adminOrderId}`}>#{o.id}</span>
                    <div className={p.clientLine}>
                      <BsPerson size={11} style={{ color: '#9ca3af' }}/>
                      <span>{o.usuario?.nome || '—'}</span>
                    </div>
                    <span className={ord.orderDate}>{fmtDate(o.createdAt)}</span>
                  </div>
                  <div className={ord.orderCardHeadRight}>
                    <span className={ord.orderTotal}>{fmt(o.total)}</span>
                    <span className={ord.statusBadge} style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    <span className={p.itemCount}>{o.itens?.length ?? 0} item(s)</span>
                    {isOpen ? <BsChevronUp className={ord.chevron}/> : <BsChevronDown className={ord.chevron}/>}
                  </div>
                </div>

                {/* ── Stepper ── */}
                {!isCancelled && (
                  <div className={ord.stepperWrap}>
                    {STEPS.map((step, i) => {
                      const done   = i < stepIdx;
                      const active = i === stepIdx;
                      const Icon   = step.icon;
                      return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? '1' : 'unset' }}>
                          <div className={`${ord.stepItem} ${done ? ord.stepDone : ''} ${active ? ord.stepActive : ''}`}>
                            <div className={ord.stepCircle}><Icon size={14}/></div>
                            <span className={ord.stepLabel}>{step.label}</span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`${ord.stepLine} ${done ? ord.stepLineDone : ''}`} style={{ flex: 1 }}/>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isCancelled && (
                  <div className={ord.cancelledBanner}>
                    <BsXCircleFill size={14}/> Pedido cancelado
                  </div>
                )}

                {/* ── Expandable body ── */}
                {isOpen && (
                  <div className={ord.orderBody}>
                    {!det ? (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Carregando detalhes…</p>
                    ) : (<>

                      {/* Items com imagens */}
                      <div className={ord.itemsList}>
                        {(det.itens || []).map((it, i) => {
                          const imgUrl = it.produto?.imagemUrl
                            ? it.produto.imagemUrl.startsWith('http')
                              ? it.produto.imagemUrl
                              : `https://geral-revestese-api.r954jc.easypanel.host${it.produto.imagemUrl}`
                            : null;
                          return (
                            <div key={i} className={ord.itemRow}>
                              <div className={ord.itemImg}>
                                {imgUrl
                                  ? <Image src={imgUrl} alt={it.produto?.nome || it.nome || 'Produto'} fill style={{ objectFit: 'cover' }} unoptimized/>
                                  : <BsBoxSeam size={18} color="#d1d5db"/>
                                }
                              </div>
                              <div className={ord.itemInfo}>
                                <span className={ord.itemName}>{it.produto?.nome || it.nome || `Item ${i + 1}`}</span>
                                {it.variacao && <span className={ord.itemVariation}>{it.variacao?.nome || it.variacao}</span>}
                              </div>
                              <span className={ord.itemQty}>×{it.quantidade}</span>
                              <span className={ord.itemPrice}>{fmt(it.preco || it.precoUnitario)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary */}
                      <div className={ord.summaryRow}>
                        <div className={ord.summaryLine}><span>Subtotal</span><span>{fmt(Number(det.total) - Number(det.valorFrete || 0) + Number(det.desconto || 0))}</span></div>
                        {Number(det.valorFrete) > 0 && <div className={ord.summaryLine}><span>Frete</span><span>{fmt(det.valorFrete)}</span></div>}
                        {Number(det.desconto) > 0 && <div className={`${ord.summaryLine} ${ord.summaryDiscount}`}><span>Desconto</span><span>−{fmt(det.desconto)}</span></div>}
                        <div className={`${ord.summaryLine} ${ord.summaryTotal}`}><span>Total</span><span>{fmt(det.total)}</span></div>
                      </div>

                      {/* ── ADMIN ZONE ── */}
                      <div className={p.adminZone}>
                        <p className={p.adminZoneTitle}>Painel Admin</p>

                        <div className={p.adminGrid}>

                          {/* Cliente */}
                          <div className={p.adminBlock}>
                            <h5><BsPerson size={13}/> Cliente</h5>
                            <p>{det.usuario?.nome || '—'}</p>
                            <p className={p.muted}>{det.usuario?.email || '—'}</p>
                          </div>

                          {/* Endereço */}
                          {det.enderecoEntrega && (
                            <div className={p.adminBlock}>
                              <h5><BsGeoAlt size={13}/> Entrega</h5>
                              <p>{det.enderecoEntrega.rua}, {det.enderecoEntrega.numero}</p>
                              <p className={p.muted}>{det.enderecoEntrega.bairro && `${det.enderecoEntrega.bairro} — `}{det.enderecoEntrega.cidade}/{det.enderecoEntrega.estado}</p>
                              <p className={p.muted}>CEP {det.enderecoEntrega.cep}</p>
                            </div>
                          )}

                          {/* Frete */}
                          {det.dadosFrete && (
                            <div className={p.adminBlock}>
                              <h5><BsTruck size={13}/> Frete</h5>
                              <p>{det.dadosFrete.name || '—'}</p>
                              <p className={p.muted}>{fmt(det.valorFrete)} · {det.dadosFrete.delivery_time ?? '—'}d úteis</p>
                            </div>
                          )}

                          {/* Cupom */}
                          {det.cupomAplicado && (
                            <div className={p.adminBlock}>
                              <h5><BsTag size={13}/> Cupom</h5>
                              <p>{det.cupomAplicado}</p>
                              <p className={p.muted}>Desconto: {fmt(det.desconto)}</p>
                            </div>
                          )}
                        </div>

                        {/* Código de rastreio */}
                        <div className={p.trackingRow}>
                          <label className={p.trackingLabel}><BsTruck size={13}/> Código de Rastreio</label>
                          <div className={p.trackingInputGroup}>
                            <input
                              className={p.trackingInput}
                              value={tracking[o.id] ?? det.dadosFrete?.codigoRastreio ?? ''}
                              onChange={e => setTracking(prev => ({ ...prev, [o.id]: e.target.value }))}
                              placeholder="Ex: BR123456789BR"
                            />
                            <button
                              className={p.trackingSaveBtn}
                              disabled={savingTrack === o.id}
                              onClick={() => handleSaveTracking(o.id)}
                            >
                              {savingTrack === o.id ? <BsArrowRepeat className={ord.spinning}/> : <BsCheckLg size={13}/>}
                              {savingTrack === o.id ? 'Salvando…' : 'Salvar'}
                            </button>
                          </div>
                        </div>

                        {/* Status + Sync */}
                        <div className={p.actionsRow}>
                          <div className={p.actionGroup}>
                            <label>Alterar status</label>
                            <select value={det.status} disabled={updating === o.id} onChange={e => handleStatusChange(o.id, e.target.value)} className={p.statusSelect}>
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                            </select>
                            {updating === o.id && <BsArrowRepeat size={14} className={ord.spinning} style={{ color: '#9ca3af' }}/>}
                          </div>

                          <button className={p.syncBtn} disabled={syncing === o.id} onClick={() => handleSync(o.id)} title="Consulta MercadoPago e atualiza status de pagamento">
                            <BsArrowRepeat className={syncing === o.id ? ord.spinning : ''} size={14}/>
                            {syncing === o.id ? 'Sincronizando…' : 'Sync pagamento'}
                          </button>
                        </div>
                      </div>

                    </>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
