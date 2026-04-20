'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WhatsAppCta.module.css';
import { FaWhatsapp } from 'react-icons/fa';
import { HiXMark } from 'react-icons/hi2';

const WhatsAppCta = () => {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '5518998184907';
  const whatsappMessage = encodeURIComponent(
    'Olá! Vi uma peça no Reveste-se e gostaria de saber mais.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <button
              className={styles.closeCard}
              onClick={() => setIsOpen(false)}
              aria-label="Fechar"
            >
              <HiXMark />
            </button>
            <p className={styles.cardTitle}>Personal Shopper</p>
            <p className={styles.cardText}>
              Tem dúvida sobre uma peça? Nossa equipe responde em minutos pelo WhatsApp.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardButton}
            >
              <FaWhatsapp />
              Falar agora
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Falar via WhatsApp"
      >
        {isOpen ? <HiXMark size={24} /> : <FaWhatsapp size={26} />}
        {!isOpen && <span className={styles.fabPulse} />}
      </motion.button>
    </div>
  );
};

export default WhatsAppCta;
