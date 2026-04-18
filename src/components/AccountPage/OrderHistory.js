// src/components/AccountPage/OrderHistory.js

'use client';

import React from 'react';
import styles from './AccountPage.module.css';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BsBoxSeam } from 'react-icons/bs';

// Defina a URL base do seu backend onde as imagens estão hospedadas
// É uma boa prática pegar isso de variáveis de ambiente, mas para simplificar, colocaremos direto por enquanto.
const BACKEND_BASE_URL = 'https://geral-revestese-api.r954jc.easypanel.host';

const OrderHistory = ({ orders }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'entregue':
      case 'concluido': 
        return styles.statusDelivered;
      case 'processando':
      case 'pago': 
        return styles.statusProcessing;
      case 'cancelado':
      case 'recusado': // Adicionado caso exista
        return styles.statusCancelled; 
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className={styles.contentTitle}>Minhas Compras</h2>
      <div className={styles.orderList}>
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div>
                  <h3>Pedido #{order.id}</h3>
                  <p>Realizado em: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>
              <div className={styles.orderItems}>
                {order.itens.map((item, index) => {
                  // Construir a URL completa da imagem
                  // Verifica se item.produto e item.produto.imagemUrl existem
                  const imageUrl = item.produto?.imagemUrl 
                                   ? `${BACKEND_BASE_URL}${item.produto.imagemUrl}` // Concatena a base URL com o caminho relativo
                                   : 'https://placehold.co/50x50.png'; // Fallback para placeholder

                  return (
                    <div key={index} className={styles.orderItem}>
                      <Image 
                          // Usar o URL completo construído
                          src={imageUrl} 
                          alt={item.nome} 
                          width={50} 
                          height={50} 
                          // Opcional: adicionar unoptimized={true} se a otimização do Next.js estiver dando problemas
                          // unoptimized={true} 
                      />
                      <span>{item.nome}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.orderTotal}>
                <strong>Total: R$ {Number(order.total).toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyStateContainer}>
            <BsBoxSeam className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>Nenhuma compra realizada ainda</h3>
            <p className={styles.emptyStateText}>Quando você fizer uma compra, seus pedidos aparecerão aqui.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderHistory;