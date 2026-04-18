'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import styles from './carrinhos.module.css';
import {
  BsCartX, BsPerson, BsCalendar3, BsChevronLeft, BsChevronRight,
  BsCurrencyDollar, BsBoxSeam, BsEnvelope, BsBarChart,
} from 'react-icons/bs';

const fmt = v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

function authHeaders() {
  const t = localStorage.getItem('reveste_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function CarrinhosPage() {
  const [data,    setData]    = useState({ lista: [], total: 0, totalValor: 0, produtosMaisAbandonados: [] });
  const [loading, setLoading] = useState(true);
  const [pagina,  setPagina]  = useState(1);
  const [aberto,  setAberto]  = useState(null); // id do carrinho expandido

  const limite = 20;

  const fetch = useCallback((p = 1) => {
    setLoading(true);
    api.get(`/analytics/carrinhos-abandonados?page=${p}&limit=${limite}`, { headers: authHeaders() })
      .then(r => setData(r.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(pagina); }, [pagina, fetch]);

  const totalPages = Math.ceil((data.total || 0) / limite);
  const lista = data.lista || [];

  return (
    <div className={styles.page}>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <BsCartX className={styles.kpiIcon} style={{ color: '#ef4444' }} />
          <div>
            <p className={styles.kpiLbl}>Carrinhos abandonados</p>
            <p className={styles.kpiVal}>{data.total || 0}</p>
          </div>
        </div>
        <div className={styles.kpi}>
          <BsCurrencyDollar className={styles.kpiIcon} style={{ color: '#f59e0b' }} />
          <div>
            <p className={styles.kpiLbl}>Valor total perdido</p>
            <p className={styles.kpiVal}>{fmt(data.totalValor)}</p>
          </div>
        </div>
        <div className={styles.kpi}>
          <BsBarChart className={styles.kpiIcon} style={{ color: '#8b5cf6' }} />
          <div>
            <p className={styles.kpiLbl}>Ticket médio abandonado</p>
            <p className={styles.kpiVal}>{lista.length > 0 ? fmt((data.totalValor || 0) / lista.length) : '—'}</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>

        {/* Lista de carrinhos */}
        <div className={styles.listaWrap}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Carrinhos abandonados</h2>
          </div>

          {loading
            ? <div className={styles.loading}><div className={styles.spinner} />Carregando...</div>
            : lista.length === 0
              ? <div className={styles.vazio}><BsCartX size={36} /><p>Nenhum carrinho abandonado registrado ainda.</p></div>
              : lista.map(c => {
                const isOpen = aberto === c.id;
                const itens = c.itens || [];
                const temUsuario = !!c.usuario;
                return (
                  <div key={c.id} className={`${styles.carrinhoCard} ${isOpen ? styles.carrinhoOpen : ''}`}>
                    <div className={styles.carrinhoHeader} onClick={() => setAberto(isOpen ? null : c.id)}>
                      <div className={styles.carrinhoMeta}>
                        <div className={styles.carrinhoAvatar}>
                          {temUsuario
                            ? c.usuario.nome?.charAt(0)?.toUpperCase()
                            : '?'
                          }
                        </div>
                        <div>
                          <p className={styles.carrinhoNome}>
                            {temUsuario ? c.usuario.nome : <span className={styles.anonimo}>Visitante anônimo</span>}
                          </p>
                          {temUsuario && (
                            <p className={styles.carrinhoEmail}><BsEnvelope /> {c.usuario.email}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.carrinhoStats}>
                        <span className={styles.statItem}>
                          <BsBoxSeam /> {itens.length} item{itens.length !== 1 ? 's' : ''}
                        </span>
                        <span className={styles.statItem}>
                          <BsCalendar3 /> {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={styles.totalBadge}>{fmt(c.total)}</span>
                        <span className={`${styles.chevron} ${isOpen ? styles.chevronUp : ''}`}>›</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className={styles.carrinhoBody}>
                        <div className={styles.itensGrid}>
                          {itens.map((item, idx) => (
                            <div key={idx} className={styles.itemCard}>
                              <div className={styles.itemIcon}><BsBoxSeam /></div>
                              <div className={styles.itemInfo}>
                                <p className={styles.itemNome}>{item.nome || `Produto #${item.produtoId}`}</p>
                                <p className={styles.itemQtd}>{item.quantidade} × {fmt(item.preco)}</p>
                              </div>
                              <div className={styles.itemTotal}>{fmt(item.quantidade * item.preco)}</div>
                            </div>
                          ))}
                        </div>

                        <div className={styles.carrinhoFooter}>
                          <span>Total do carrinho:</span>
                          <strong>{fmt(c.total)}</strong>
                        </div>

                        {temUsuario && (
                          <a
                            href={`/admin/clientes?id=${c.usuario.id}`}
                            className={styles.linkCliente}
                            onClick={e => { e.preventDefault(); window.location.href = `/admin/clientes`; }}
                          >
                            <BsPerson /> Ver perfil completo do cliente
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
          }

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
        </div>

        {/* Top produtos abandonados */}
        <div className={styles.topWrap}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Produtos mais abandonados</h2>
          </div>
          {(data.produtosMaisAbandonados || []).length === 0
            ? <div className={styles.vazio} style={{ minHeight: 120 }}><p style={{ fontSize: '0.8rem' }}>Sem dados ainda</p></div>
            : (
              <ul className={styles.topList}>
                {(data.produtosMaisAbandonados || []).map((p, i) => (
                  <li key={i} className={styles.topItem}>
                    <span className={styles.topRank} style={{
                      background: i < 3 ? '#fef2f2' : '#f9fafb',
                      color: i < 3 ? '#ef4444' : '#9ca3af',
                    }}>{i + 1}</span>
                    <span className={styles.topNome}>{p.nome}</span>
                    <span className={styles.topVezes}>{p.vezes}× abandonado</span>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

      </div>
    </div>
  );
}
