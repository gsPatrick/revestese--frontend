'use client';

import React, { useState } from 'react';
import styles from './AccountPage.module.css';
import { motion } from 'framer-motion';
import { BsPencil, BsTrash, BsPlusCircleDotted, BsHouseHeart } from 'react-icons/bs';
import AddressModal from './modals/AddressModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const AddressManager = ({ addresses, onAddressChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleSaveAddress = (newAddress) => {
    // A maneira ideal é atualizar o estado no componente pai, mas um reload funciona para simplicidade.
    // Se onAddressChange for uma função que refaz o fetch dos dados, use-a.
    // if (onAddressChange) onAddressChange(); 
    console.log('Novo endereço salvo:', newAddress);
    window.location.reload();
  };

  return (
    <>
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAddress}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className={styles.contentTitle}>Meus Endereços</h2>
        <p className={styles.contentSubtitle}>
          Gerencie seus endereços de entrega para uma finalização de compra mais rápida.
        </p>
        
        {addresses && addresses.length > 0 ? (
          <div className={styles.addressList}>
              {addresses.map((address) => (
              <motion.div key={address.id} className={styles.addressCard} variants={itemVariants}>
                  <div className={styles.addressContent}>
                  <div className={styles.addressAlias}>
                      {address.apelido || 'Endereço'}
                      {address.principal && <span className={styles.primaryBadge}>Principal</span>}
                  </div>
                  <p>
                      {address.rua}, {address.numero}<br />
                      {address.cidade}, {address.estado}<br />
                      CEP: {address.cep}
                  </p>
                  </div>
                  <div className={styles.addressActions}>
                  <button aria-label="Editar endereço"><BsPencil /></button>
                  <button aria-label="Remover endereço"><BsTrash /></button>
                  </div>
              </motion.div>
              ))}
              <motion.button 
                className={styles.addAddressButton} 
                variants={itemVariants}
                onClick={() => setIsModalOpen(true)}
              >
                <BsPlusCircleDotted />
                <span>Adicionar Novo Endereço</span>
              </motion.button>
          </div>
        ) : (
          <div className={styles.emptyStateContainer}>
              <BsHouseHeart className={styles.emptyStateIcon} />
              <h3 className={styles.emptyStateTitle}>Nenhum endereço cadastrado</h3>
              <p className={styles.emptyStateText}>Adicione um endereço para agilizar suas próximas compras.</p>
              <motion.button 
                className={styles.addAddressButton} 
                style={{marginTop: '2rem'}}
                onClick={() => setIsModalOpen(true)}
              >
                  <BsPlusCircleDotted />
                  <span>Adicionar Primeiro Endereço</span>
              </motion.button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AddressManager;