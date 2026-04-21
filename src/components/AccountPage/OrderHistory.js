'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AccountPage.module.css';
import ord from './OrderHistory.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsBoxSeam, BsCheckCircleFill, BsClockFill, BsCreditCard2FrontFill,
  BsGearFill, BsTruck, BsHouseCheckFill, BsXCircleFill,
  BsChevronDown, BsChevronUp, BsArrowRepeat, BsXLg,
} from 'react-icons/bs';
import api from '@/services/api';

const fmt = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Stepper definition ──────────────────────────────────────────────────────
const STEPS = [
  { key: 'criado',     label: 'Pedido Criado',       icon: BsCheckCircleFill  },
  { key: 'pendente',   label: 'Aguardando Pagamento', icon: BsClockFill        },
  { key: 'pago',       label: 'Pag. Confirmado',      icon: BsCreditCard2FrontFill },
  { key: 'preparando', label: 'Em Preparação',        icon: BsGearFill         },
  { key: 'enviado',    label: 'Enviado',              icon: BsTruck            },
  { key: 'entregue',   label: 'Entregue',             icon: BsHouseCheckFill   },
];

const STATUS_STEP = {
  pendente:   1,
  pago:       2,
  preparando: 3,
  enviado:    4,
  entregue:   5,
  cancelado:  -1,
};

const STATUS_LABEL = {
  pendente:   'Aguardando Pagamento',
  pago:       'Pago',
  preparando: 'Em Preparação',
  enviado:    'Enviado',
  entregue:   'Entregue',
  cancelado:  'Cancelado',
};

const STATUS_COLOR = {
  pendente:   { bg: '#fef3c7', color: '#92400e' },
  pago:       { bg: '#d1fae5', color: '#065f46' },
  preparando: { bg: '#ede9fe', color: '#4c1d95' },
  enviado:    { bg: '#dbeafe', color: '#1e40af' },
  entregue:   { bg: '#d1fae5', color: '#065f46' },
  cancelado:  { bg: '#fee2e2', color: '#991b1b' },
};

// ── Component ───────────────────────────────────────────────────────────────
const OrderHistory = ({ orders: initialOrders }) => {
  const [orders, setOrders]     = useState(initialOrders || []);
  const [expanded, setExpanded] = useState(null);
  const [loadingPay, setLoadingPay] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handlePayNow = async (orderId) => {
    setLoadingPay(orderId);
    try {
      const r = await api.post('/pagamentos/checkout', { pedidoId: orderId });
      const url = r.data.checkoutUrl || r.data.url;
      if (url) window.location.href = url;
      else showToast('Não foi possível obter o link de pagamento.');
    } catch {
      showToast('Erro ao buscar link de pagamento. Tente novamente.');
    } finally {
      setLoadingPay(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) return;
    setLoadingCancel(orderId);
    try {
      await api.delete(`/pedidos/${orderId}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelado' } : o));
      showToast('Pedido cancelado com sucesso.');
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao cancelar pedido.');
    } finally {
      setLoadingCancel(null);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className={styles.contentTitle}>Meus Pedidos</h2>
        <div className={styles.emptyStateContainer}>
          <BsBoxSeam className={styles.emptyStateIcon} />
          <h3 className={styles.emptyStateTitle}>Nenhuma compra realizada ainda</h3>
          <p className={styles.emptyStateText}>Quando você fizer uma compra, seus pedidos aparecerão aqui.</p>
          <Link href="/catalogo" className={ord.shopNowBtn}>Explorar peças</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {toast && <div className={ord.toast}>{toast}</div>}
      <h2 className={styles.contentTitle}>Meus Pedidos</h2>
      <p className={styles.contentSubtitle}>{orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}</p>

      <div className={ord.orderList}>
        {orders.map((order) => {
          const stepIdx  = STATUS_STEP[order.status] ?? 1;
          const isCancelled = order.status === 'cancelado';
          const isPending   = order.status === 'pendente';
          const statusMeta  = STATUS_COLOR[order.status] || { bg: '#f3f4f6', color: '#374151' };
          const isOpen      = expanded === order.id;

          return (
            <div key={order.id} className={`${ord.orderCard} ${isOpen ? ord.orderCardOpen : ''}`}>

              {/* ── Header row (always visible) ── */}
              <div className={ord.orderCardHead} onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className={ord.orderCardHeadLeft}>
                  <span className={ord.orderId}>Pedido #{order.id}</span>
                  <span className={ord.orderDate}>{fmtDate(order.createdAt)}</span>
                </div>
                <div className={ord.orderCardHeadRight}>
                  <span className={ord.orderTotal}>{fmt(order.total)}</span>
                  <span className={ord.statusBadge} style={{ background: statusMeta.bg, color: statusMeta.color }}>
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
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
                      <React.Fragment key={step.key}>
                        <div className={`${ord.stepItem} ${done ? ord.stepDone : ''} ${active ? ord.stepActive : ''}`}>
                          <div className={ord.stepCircle}><Icon size={14}/></div>
                          <span className={ord.stepLabel}>{step.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`${ord.stepLine} ${done ? ord.stepLineDone : ''}`}/>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {isCancelled && (
                <div className={ord.cancelledBanner}>
                  <BsXCircleFill size={16}/> Este pedido foi cancelado
                </div>
              )}

              {/* ── Expandable body ── */}
              <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className={ord.orderBody}
                >
                  {/* Items */}
                  <div className={ord.itemsList}>
                    {(order.itens || []).map((item, idx) => {
                      const imgUrl = item.produto?.imagemUrl
                        ? item.produto.imagemUrl.startsWith('http')
                          ? item.produto.imagemUrl
                          : `https://n8n-doodledreamsmidia.r954jc.easypanel.host${item.produto.imagemUrl}`
                        : null;
                      return (
                        <div key={idx} className={ord.itemRow}>
                          <div className={ord.itemImg}>
                            {imgUrl
                              ? <Image src={imgUrl} alt={item.produto?.nome || item.nome || 'Produto'} fill style={{ objectFit: 'cover' }} unoptimized/>
                              : <BsBoxSeam size={20} color="#d1d5db"/>
                            }
                          </div>
                          <div className={ord.itemInfo}>
                            <span className={ord.itemName}>{item.produto?.nome || item.nome || `Item ${idx + 1}`}</span>
                            {item.variacao && <span className={ord.itemVariation}>{item.variacao?.nome || item.variacao}</span>}
                          </div>
                          <span className={ord.itemQty}>×{item.quantidade}</span>
                          <span className={ord.itemPrice}>{fmt(item.preco || item.precoUnitario)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary */}
                  <div className={ord.summaryRow}>
                    <div className={ord.summaryLine}>
                      <span>Subtotal</span>
                      <span>{fmt(Number(order.total) - Number(order.valorFrete || 0) + Number(order.desconto || 0))}</span>
                    </div>
                    {Number(order.valorFrete) > 0 && (
                      <div className={ord.summaryLine}>
                        <span>Frete</span><span>{fmt(order.valorFrete)}</span>
                      </div>
                    )}
                    {Number(order.desconto) > 0 && (
                      <div className={`${ord.summaryLine} ${ord.summaryDiscount}`}>
                        <span>Desconto</span><span>−{fmt(order.desconto)}</span>
                      </div>
                    )}
                    <div className={`${ord.summaryLine} ${ord.summaryTotal}`}>
                      <span>Total</span><span>{fmt(order.total)}</span>
                    </div>
                  </div>

                  {/* Endereço (if available) */}
                  {order.enderecoEntrega && (
                    <div className={ord.addressBox}>
                      <p className={ord.addressTitle}>Endereço de entrega</p>
                      <p>{order.enderecoEntrega.rua}, {order.enderecoEntrega.numero}
                        {order.enderecoEntrega.complemento && ` — ${order.enderecoEntrega.complemento}`}
                      </p>
                      <p>{order.enderecoEntrega.bairro && `${order.enderecoEntrega.bairro}, `}{order.enderecoEntrega.cidade}/{order.enderecoEntrega.estado} · CEP {order.enderecoEntrega.cep}</p>
                    </div>
                  )}

                  {/* CTA buttons for pending orders */}
                  {isPending && (
                    <div className={ord.ctaRow}>
                      <button
                        className={ord.payBtn}
                        disabled={loadingPay === order.id}
                        onClick={() => handlePayNow(order.id)}
                      >
                        {loadingPay === order.id
                          ? <><BsArrowRepeat className={ord.spinning}/> Buscando link…</>
                          : <><BsCreditCard2FrontFill size={15}/> Continuar para Pagamento</>
                        }
                      </button>
                      <button
                        className={ord.cancelBtn}
                        disabled={loadingCancel === order.id}
                        onClick={() => handleCancel(order.id)}
                      >
                        {loadingCancel === order.id
                          ? <><BsArrowRepeat className={ord.spinning}/> Cancelando…</>
                          : <><BsXLg size={13}/> Cancelar Pedido</>
                        }
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default OrderHistory;
