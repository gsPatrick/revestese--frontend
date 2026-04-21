'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from './Dashboard.module.css';
import {
  BsCurrencyDollar, BsCart3, BsPeople, BsBox,
  BsEye, BsCartX, BsArrowUpRight,
} from 'react-icons/bs';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const STATUS_LABEL = {
  pendente:  { label: 'Pendente',  color: '#f59e0b' },
  pago:      { label: 'Pago',      color: '#10b981' },
  enviado:   { label: 'Enviado',   color: '#3b82f6' },
  entregue:  { label: 'Entregue',  color: '#6366f1' },
  cancelado: { label: 'Cancelado', color: '#ef4444' },
};

const TIPO_LABEL = {
  home:     'Home',
  catalogo: 'Catálogo',
  produto:  'Produto',
  contato:  'Contato',
  sobre:    'Sobre Nós',
  outro:    'Outros',
};

const COLORS = ['#111111', '#C9A84C', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

const fmt  = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const fmtN = (v) => Number(v || 0).toLocaleString('pt-BR');

function CustomTooltip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 6, padding: '0.6rem 1rem', fontSize: '0.78rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#374151' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color }}>
          {p.name}: <strong>{money ? fmt(p.value) : fmtN(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [metrics,    setMetrics]    = useState(null);
  const [sales,      setSales]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [topProds,   setTopProds]   = useState([]);
  const [acessos,    setAcessos]    = useState({ porDia: [], porTipo: [], totalPeriodo: 0 });
  const [prods,      setProds]      = useState([]);
  const [carrinhos,  setCarrinhos]  = useState({ totalAbandonados: 0, totalValor: 0, produtosMaisAbandonados: [] });
  const [periodoAcessos, setPeriodoAcessos] = useState('semana');
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      api.get('/dashboard/metricas', { headers }),
      api.get('/dashboard/vendas?periodo=dia', { headers }),
      api.get('/dashboard/produtos-mais-vendidos', { headers }),
      api.get('/pedidos?limit=8', { headers }),
    ]).then(([m, s, p, o]) => {
      setMetrics(m.data);
      setSales((s.data || []).map(d => ({
        ...d,
        label: d.periodo ? d.periodo.slice(5) : d.periodo,
      })));
      setTopProds(p.data || []);
      setOrders(o.data?.pedidos || o.data || []);
    }).catch(console.error).finally(() => setLoading(false));

    Promise.all([
      api.get('/analytics/acessos?periodo=semana', { headers }),
      api.get('/analytics/produtos-vistos', { headers }),
      api.get('/analytics/carrinhos-abandonados', { headers }),
    ]).then(([a, pv, ca]) => {
      setAcessos(a.data || { porDia: [], porTipo: [], totalPeriodo: 0 });
      setProds(pv.data || []);
      setCarrinhos(ca.data || { totalAbandonados: 0, totalValor: 0, produtosMaisAbandonados: [] });
    }).catch(() => {});
  }, []);

  const fetchAcessos = (periodo) => {
    setPeriodoAcessos(periodo);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    api.get(`/analytics/acessos?periodo=${periodo}`, { headers })
      .then(r => setAcessos(r.data || { porDia: [], porTipo: [], totalPeriodo: 0 }))
      .catch(() => {});
  };

  const kpis = metrics ? [
    { icon: <BsCurrencyDollar />, label: 'Faturamento hoje',  value: fmt(metrics.faturamentoHoje), sub: 'pedidos pagos',  color: '#111111' },
    { icon: <BsCart3 />,          label: 'Vendas hoje',       value: fmtN(metrics.vendasHoje),     sub: 'pedidos',        color: '#C9A84C' },
    { icon: <BsPeople />,         label: 'Clientes ativos',   value: fmtN(metrics.clientesTotal),  sub: 'cadastrados',    color: '#3b82f6' },
    { icon: <BsBox />,            label: 'Produtos ativos',   value: fmtN(metrics.produtosTotal),  sub: 'no catálogo',    color: '#10b981' },
  ] : [];

  const analyticsKpis = [
    { icon: <BsEye />,   label: 'Acessos (período)',    value: fmtN(acessos.totalPeriodo),        color: '#8b5cf6' },
    { icon: <BsCartX />, label: 'Carrinhos abandonados', value: fmtN(carrinhos.totalAbandonados), color: '#ef4444' },
    { icon: <BsCurrencyDollar />, label: 'Valor abandonado', value: fmt(carrinhos.totalValor),    color: '#f59e0b' },
  ];

  const porDiaFormatted = (acessos.porDia || []).map(d => ({
    ...d,
    label: d.data ? d.data.slice(5).replace('-', '/') : d.data,
  }));

  const porTipoFormatted = (acessos.porTipo || []).map(d => ({
    ...d,
    name: TIPO_LABEL[d.tipo] || d.tipo,
  }));

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>Carregando dashboard...</p>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* ── KPIs principais ── */}
      <section>
        <h2 className={styles.sectionTitle}>Visão Geral</h2>
        <div className={styles.kpiGrid}>
          {kpis.map((c, i) => (
            <div key={i} className={styles.kpiCard}>
              <div className={styles.kpiIcon} style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
              <div>
                <p className={styles.kpiLabel}>{c.label}</p>
                <p className={styles.kpiValue}>{c.value}</p>
                <p className={styles.kpiSub}>{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gráficos de vendas e top produtos ── */}
      <div className={styles.row}>
        <div className={styles.card} style={{ flex: 2 }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Faturamento recente</h2>
            <span className={styles.cardMeta}>últimos 30 dias</span>
          </div>
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={sales} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} width={65} />
                <Tooltip content={<CustomTooltip money />} />
                <Bar dataKey="total" name="Faturamento" fill="#111111" radius={[4, 4, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.emptyChart}>Nenhuma venda registrada ainda</div>
          )}
        </div>

        <div className={styles.card} style={{ flex: 1, minWidth: 240 }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Mais vendidos</h2>
          </div>
          <ul className={styles.rankList}>
            {topProds.slice(0, 7).map((p, i) => {
              const nomeProd = p.produto?.nome || p.nome || p.name || `Produto #${p.id}`;
              const slug = p.produto?.slug || p.produto?.id;
              return (
                <li key={i} className={styles.rankItem}>
                  <span className={styles.rankBadge} style={{ background: i < 3 ? '#11111122' : '#f3f4f6', color: i < 3 ? '#111111' : '#6b7280' }}>{i + 1}</span>
                  {slug
                    ? <a href={`/product/${slug}`} target="_blank" rel="noreferrer" className={styles.rankLink}>{nomeProd}</a>
                    : <span className={styles.rankName}>{nomeProd}</span>
                  }
                  <span className={styles.rankVal}>{p.quantidade ?? '—'} un.</span>
                </li>
              );
            })}
            {topProds.length === 0 && <li className={styles.emptyList}>Sem vendas registradas</li>}
          </ul>
        </div>
      </div>

      {/* ── Analytics de Acessos ── */}
      <section>
        <div className={styles.sectionHeaderRow}>
          <h2 className={styles.sectionTitle}>Analytics de Acessos</h2>
          <div className={styles.periodTabs}>
            {['dia', 'semana', 'mes'].map(p => (
              <button key={p} onClick={() => fetchAcessos(p)}
                className={`${styles.periodTab} ${periodoAcessos === p ? styles.periodTabActive : ''}`}>
                {p === 'dia' ? 'Últimos 7d' : p === 'semana' ? 'Últimos 30d' : 'Últimos 3m'}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs analytics */}
        <div className={styles.analyticsKpis}>
          {analyticsKpis.map((c, i) => (
            <div key={i} className={styles.smallKpi}>
              <div className={styles.kpiIcon} style={{ background: c.color + '18', color: c.color, width: 36, height: 36, fontSize: '1rem' }}>{c.icon}</div>
              <div>
                <p className={styles.kpiLabel}>{c.label}</p>
                <p className={styles.kpiValue} style={{ fontSize: '1.15rem' }}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.row}>
          {/* Acessos por dia */}
          <div className={styles.card} style={{ flex: 2 }}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Acessos por dia</h2>
            </div>
            {porDiaFormatted.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={porDiaFormatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#111111" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="total"   name="Total"   stroke="#8b5cf6" fill="url(#gradTotal)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="produto" name="Produto"  stroke="#111111" fill="url(#gradProd)"  strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="catalogo" name="Catálogo" stroke="#C9A84C" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <BsEye size={32} style={{ color: '#d1d5db', marginBottom: 8 }} />
                <p>Nenhum acesso registrado ainda.<br /><span style={{ fontSize: '0.75rem' }}>Os dados aparecerão conforme usuários visitam o site.</span></p>
              </div>
            )}
          </div>

          {/* Distribuição por tipo */}
          <div className={styles.card} style={{ flex: 1, minWidth: 240 }}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Por página</h2>
            </div>
            {porTipoFormatted.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={porTipoFormatted} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {porTipoFormatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtN(v)} contentStyle={{ fontSize: '0.75rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <ul className={styles.legendList}>
                  {porTipoFormatted.map((d, i) => (
                    <li key={i} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={styles.legendName}>{d.name}</span>
                      <span className={styles.legendVal}>{fmtN(d.total)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={styles.emptyChart}>Sem dados</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Produtos mais visitados ── */}
      <div className={styles.row}>
        <div className={styles.card} style={{ flex: 1 }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Produtos mais visitados</h2>
          </div>
          {prods.length > 0 ? (() => {
            const truncate = (s, n = 24) => s?.length > n ? s.slice(0, n) + '…' : (s || '');
            const prodsChart = prods.slice(0, 8).map(p => ({ ...p, nomeAbrev: truncate(p.nome) }));
            const chartH = Math.max(260, prodsChart.length * 38);
            return (
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={prodsChart} layout="vertical" margin={{ top: 4, right: 30, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nomeAbrev"
                    width={170}
                    tick={{ fontSize: 11, fill: '#374151' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0]?.payload;
                      return (
                        <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 6, padding: '0.5rem 0.85rem', fontSize: '0.78rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                          <p style={{ margin: '0 0 3px', fontWeight: 700, color: '#374151', maxWidth: 200 }}>{item?.nome}</p>
                          <p style={{ margin: 0, color: '#C9A84C' }}>Visualizações: <strong>{item?.views}</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="views" name="Visualizações" fill="#C9A84C" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            );
          })() : (
            <div className={styles.emptyChart}>Nenhuma visualização de produto registrada</div>
          )}
        </div>

        {/* Carrinhos abandonados */}
        <div className={styles.card} style={{ flex: 1, minWidth: 280 }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Produtos abandonados no carrinho</h2>
          </div>
          {carrinhos.produtosMaisAbandonados?.length > 0 ? (
            <ul className={styles.rankList}>
              {carrinhos.produtosMaisAbandonados.map((p, i) => (
                <li key={i} className={styles.rankItem}>
                  <span className={styles.rankBadge} style={{ background: '#fef2f2', color: '#ef4444' }}>{i + 1}</span>
                  <span className={styles.rankName}>{p.nome || `Produto #${p.produtoId}`}</span>
                  <span className={styles.rankVal} style={{ color: '#ef4444' }}>{p.vezes}x</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyChart}>
              <BsCartX size={28} style={{ color: '#d1d5db', marginBottom: 8 }} />
              <p>Nenhum carrinho abandonado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Últimos pedidos ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Últimos pedidos</h2>
          <a href="/admin/pedidos" className={styles.viewAll}>Ver todos <BsArrowUpRight /></a>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th><th>Cliente</th><th>Total</th><th>Status</th><th>Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o, i) => {
                const st = STATUS_LABEL[o.status] || { label: o.status, color: '#6b7280' };
                return (
                  <tr key={i}>
                    <td className={styles.tdMono}>#{o.id}</td>
                    <td>{o.usuario?.nome || o.cliente || '—'}</td>
                    <td><strong>{fmt(o.total)}</strong></td>
                    <td>
                      <span className={styles.badge} style={{ background: st.color + '22', color: st.color }}>{st.label}</span>
                    </td>
                    <td className={styles.tdMuted}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={5} className={styles.emptyList}>Nenhum pedido encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
