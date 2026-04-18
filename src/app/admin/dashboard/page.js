'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from './Dashboard.module.css';
import { BsCurrencyDollar, BsCart3, BsPeople, BsBox } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_LABEL = {
  pendente: { label: 'Pendente',    color: '#f59e0b' },
  pago:     { label: 'Pago',        color: '#10b981' },
  enviado:  { label: 'Enviado',     color: '#3b82f6' },
  entregue: { label: 'Entregue',    color: '#6366f1' },
  cancelado:{ label: 'Cancelado',   color: '#ef4444' },
};

export default function DashboardPage() {
  const [metrics,  setMetrics]  = useState(null);
  const [sales,    setSales]    = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [topProds, setTopProds] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/metricas'),
      api.get('/dashboard/vendas'),
      api.get('/dashboard/produtos-mais-vendidos'),
      api.get('/pedidos?limit=8'),
    ]).then(([m, s, p, o]) => {
      setMetrics(m.data);
      setSales(s.data || []);
      setTopProds(p.data || []);
      setOrders(o.data?.pedidos || o.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const cards = metrics ? [
    { icon: <BsCurrencyDollar />, label: 'Faturamento hoje',  value: fmt(metrics.faturamentoHoje),  color: '#780e1a' },
    { icon: <BsCart3 />,          label: 'Vendas hoje',       value: metrics.vendasHoje ?? '—',       color: '#C9A84C' },
    { icon: <BsPeople />,         label: 'Total clientes',    value: metrics.totalClientes ?? '—',    color: '#3b82f6' },
    { icon: <BsBox />,            label: 'Produtos ativos',   value: metrics.totalProdutos ?? '—',    color: '#10b981' },
  ] : [];

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.page}>
      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {cards.map((c, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
            <div>
              <p className={styles.kpiLabel}>{c.label}</p>
              <p className={styles.kpiValue}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.row}>
        {/* Gráfico */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Faturamento recente</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sales} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: '4px', fontSize: '0.8rem' }} />
              <Bar dataKey="faturamento" fill="#780e1a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top produtos */}
        <div className={styles.card} style={{ maxWidth: 280 }}>
          <h2 className={styles.cardTitle}>Mais vendidos</h2>
          <ul className={styles.topList}>
            {topProds.slice(0, 6).map((p, i) => (
              <li key={i} className={styles.topItem}>
                <span className={styles.topRank}>{i + 1}</span>
                <span className={styles.topName}>{p.nome || p.name}</span>
                <span className={styles.topQty}>{p.totalVendido ?? p.vendas ?? '—'}</span>
              </li>
            ))}
            {topProds.length === 0 && <li className={styles.empty}>Sem dados</li>}
          </ul>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Últimos pedidos</h2>
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
                    <td>{fmt(o.total)}</td>
                    <td>
                      <span className={styles.badge} style={{ background: st.color + '22', color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className={styles.tdMuted}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={5} className={styles.empty}>Nenhum pedido encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
