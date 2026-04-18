'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import styles from './clientes.module.css';
import {
  BsSearch, BsPerson, BsEnvelope, BsCart3, BsCartX,
  BsChevronLeft, BsChevronRight, BsCurrencyDollar,
  BsCalendar3, BsArrowLeft, BsBoxSeam, BsXCircle,
  BsCheckCircle, BsClockHistory, BsTruck, BsShop,
  BsEye,
} from 'react-icons/bs';

const fmt = v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const STATUS_CFG = {
  pendente:  { label: 'Pendente',  color: '#f59e0b', icon: <BsClockHistory /> },
  pago:      { label: 'Pago',      color: '#10b981', icon: <BsCheckCircle /> },
  enviado:   { label: 'Enviado',   color: '#3b82f6', icon: <BsTruck /> },
  entregue:  { label: 'Entregue',  color: '#6366f1', icon: <BsShop /> },
  cancelado: { label: 'Cancelado', color: '#ef4444', icon: <BsXCircle /> },
};

function authHeaders() {
  const t = localStorage.getItem('reveste_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ─── Tela de detalhe de um cliente ───────────────────────────────────────────
function ClienteDetalhe({ clienteId, onBack }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('pedidos'); // 'pedidos' | 'carrinhos' | 'resumo'

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/clientes/${clienteId}`, { headers: authHeaders() })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clienteId]);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} />Carregando cliente...</div>;
  if (!data)   return <div className={styles.loading}>Cliente não encontrado.</div>;

  const { usuario, pedidos, carrinhos, stats } = data;

  return (
    <div className={styles.detalhe}>
      {/* Header do cliente */}
      <div className={styles.detalheHeader}>
        <button className={styles.backBtn} onClick={onBack}><BsArrowLeft /> Voltar</button>
        <div className={styles.clienteAvatar}>{usuario.nome?.charAt(0)?.toUpperCase() || '?'}</div>
        <div>
          <h2 className={styles.clienteNome}>{usuario.nome}</h2>
          <p className={styles.clienteEmail}><BsEnvelope /> {usuario.email}</p>
          <p className={styles.clienteSince}>Cliente desde {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* KPIs do cliente */}
      <div className={styles.clienteKpis}>
        <div className={styles.clienteKpi}>
          <BsCurrencyDollar className={styles.kpiIcon} style={{ color: '#10b981' }} />
          <div>
            <p className={styles.kpiLbl}>Total gasto</p>
            <p className={styles.kpiVal}>{fmt(stats.totalGasto)}</p>
          </div>
        </div>
        <div className={styles.clienteKpi}>
          <BsCart3 className={styles.kpiIcon} style={{ color: '#780e1a' }} />
          <div>
            <p className={styles.kpiLbl}>Pedidos pagos</p>
            <p className={styles.kpiVal}>{stats.totalPedidos}</p>
          </div>
        </div>
        <div className={styles.clienteKpi}>
          <BsCartX className={styles.kpiIcon} style={{ color: '#ef4444' }} />
          <div>
            <p className={styles.kpiLbl}>Carrinhos abandonados</p>
            <p className={styles.kpiVal}>{stats.totalCarrinhos}</p>
          </div>
        </div>
        <div className={styles.clienteKpi}>
          <BsEye className={styles.kpiIcon} style={{ color: '#8b5cf6' }} />
          <div>
            <p className={styles.kpiLbl}>Acessos rastreados</p>
            <p className={styles.kpiVal}>{stats.totalAcessos}</p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className={styles.tabs}>
        <button onClick={() => setTab('pedidos')}  className={`${styles.tab} ${tab === 'pedidos'   ? styles.tabActive : ''}`}>
          <BsCart3 /> Histórico de compras ({pedidos.length})
        </button>
        <button onClick={() => setTab('carrinhos')} className={`${styles.tab} ${tab === 'carrinhos' ? styles.tabActive : ''}`}>
          <BsCartX /> Carrinhos abandonados ({carrinhos.length})
        </button>
      </div>

      {/* Pedidos */}
      {tab === 'pedidos' && (
        <div className={styles.secao}>
          {pedidos.length === 0
            ? <p className={styles.vazio}>Nenhum pedido realizado.</p>
            : pedidos.map(p => {
              const st = STATUS_CFG[p.status] || { label: p.status, color: '#6b7280', icon: null };
              return (
                <div key={p.id} className={styles.pedidoCard}>
                  <div className={styles.pedidoTop}>
                    <span className={styles.pedidoId}>Pedido #{p.id}</span>
                    <span className={styles.pedidoBadge} style={{ background: st.color + '22', color: st.color }}>
                      {st.icon} {st.label}
                    </span>
                    <span className={styles.pedidoData}><BsCalendar3 /> {new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className={styles.pedidoTotal}>{fmt(p.total)}</span>
                  </div>
                  <div className={styles.pedidoItens}>
                    {(p.itens || []).map((item, idx) => (
                      <div key={idx} className={styles.pedidoItem}>
                        <div className={styles.pedidoItemImagem}>
                          {item.imagemUrl
                            ? <img src={item.imagemUrl} alt={item.nome} />
                            : <BsBoxSeam />
                          }
                        </div>
                        <div className={styles.pedidoItemInfo}>
                          <p className={styles.pedidoItemNome}>{item.nome || `Produto #${item.produtoId}`}</p>
                          {item.variacao && <p className={styles.pedidoItemVar}>{item.variacao}</p>}
                          <p className={styles.pedidoItemQtd}>{item.quantidade} × {fmt(item.preco)}</p>
                        </div>
                        <div className={styles.pedidoItemTotal}>{fmt(item.quantidade * item.preco)}</div>
                      </div>
                    ))}
                  </div>
                  {p.enderecoEntrega && (
                    <div className={styles.pedidoEndereco}>
                      <BsTruck style={{ flexShrink: 0 }} />
                      {p.enderecoEntrega.rua}, {p.enderecoEntrega.numero} — {p.enderecoEntrega.cidade}/{p.enderecoEntrega.estado}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* Carrinhos */}
      {tab === 'carrinhos' && (
        <div className={styles.secao}>
          {carrinhos.length === 0
            ? <p className={styles.vazio}>Nenhum carrinho abandonado registrado.</p>
            : carrinhos.map(c => (
              <div key={c.id} className={styles.carrinhoCard}>
                <div className={styles.carrinhoTop}>
                  <span className={styles.carrinhoData}><BsCalendar3 /> {new Date(c.createdAt).toLocaleDateString('pt-BR')} {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={styles.carrinhoTotal}>{fmt(c.total)}</span>
                </div>
                <div className={styles.carrinhoItens}>
                  {(c.itens || []).map((item, idx) => (
                    <div key={idx} className={styles.carrinhoItem}>
                      <span className={styles.carrinhoItemNome}>{item.nome || `Produto #${item.produtoId}`}</span>
                      <span className={styles.carrinhoItemQtd}>{item.quantidade}×</span>
                      <span className={styles.carrinhoItemPreco}>{fmt(item.preco)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ─── Lista de clientes ────────────────────────────────────────────────────────
export default function ClientesPage() {
  const [clientes,  setClientes]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pagina,    setPagina]    = useState(1);
  const [busca,     setBusca]     = useState('');
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null); // id do cliente selecionado

  const limite = 20;

  const fetchClientes = useCallback((p = 1, q = '') => {
    setLoading(true);
    api.get(`/analytics/clientes?page=${p}&limit=${limite}&busca=${q}`, { headers: authHeaders() })
      .then(r => { setClientes(r.data.clientes || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchClientes(pagina, busca); }, [pagina, fetchClientes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagina(1);
    fetchClientes(1, busca);
  };

  if (selected !== null) {
    return <ClienteDetalhe clienteId={selected} onBack={() => setSelected(null)} />;
  }

  const totalPages = Math.ceil(total / limite);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Clientes</h1>
          <p className={styles.sub}>{total} cliente{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.searchBar}>
        <div className={styles.searchWrap}>
          <BsSearch className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <button className={styles.searchBtn} type="submit">Buscar</button>
      </form>

      {loading
        ? <div className={styles.loading}><div className={styles.spinner} />Carregando clientes...</div>
        : (
          <>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>E-mail</th>
                    <th>Pedidos pagos</th>
                    <th>Total gasto</th>
                    <th>Carrinhos abandonados</th>
                    <th>Cadastro</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(c => (
                    <tr key={c.id} className={styles.tr}>
                      <td>
                        <div className={styles.clienteCell}>
                          <div className={styles.miniAvatar}>{c.nome?.charAt(0)?.toUpperCase() || '?'}</div>
                          <span className={styles.clienteCellNome}>{c.nome}</span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{c.email}</td>
                      <td>
                        <span className={styles.numBadge} style={{ background: c.totalPedidos > 0 ? '#ecfdf5' : '#f9fafb', color: c.totalPedidos > 0 ? '#065f46' : '#9ca3af' }}>
                          {c.totalPedidos} pedido{c.totalPedidos !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className={styles.totalCell}>{c.totalGasto > 0 ? fmt(c.totalGasto) : <span className={styles.zero}>—</span>}</td>
                      <td>
                        {c.totalCarrinhosAbandonados > 0
                          ? <span className={styles.numBadge} style={{ background: '#fef2f2', color: '#991b1b' }}>
                              <BsCartX /> {c.totalCarrinhosAbandonados}
                            </span>
                          : <span className={styles.zero}>—</span>
                        }
                      </td>
                      <td className={styles.dateCell}>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <button className={styles.verBtn} onClick={() => setSelected(c.id)}>
                          <BsEye /> Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {clientes.length === 0 && (
                    <tr><td colSpan={7} className={styles.vazio}>Nenhum cliente encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button className={styles.pageBtn} onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
                  <BsChevronLeft />
                </button>
                <span className={styles.pageInfo}>{pagina} / {totalPages}</span>
                <button className={styles.pageBtn} onClick={() => setPagina(p => Math.min(totalPages, p + 1))} disabled={pagina === totalPages}>
                  <BsChevronRight />
                </button>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}
