// src/components/CouponPopup/CouponPopup.js

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CouponPopup.module.css'; // Estilos customizados
import api from '@/services/api'; // Para buscar o cupom principal
import Image from 'next/image'; // Para elementos decorativos SVG
import { BsX, BsEnvelopePaperFill, BsStars } from 'react-icons/bs'; // Ícones
import { HiOutlineSparkles } from 'react-icons/hi'; // Outro ícone para brilho
import { RiCoupon3Line } from 'react-icons/ri'; // Ícone de cupom

const CouponPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false); // Estado para feedback de "copiado"

  const popupRef = useRef(null); // Ref para detectar cliques fora do modal

  // 1. Lógica para buscar o cupom principal
  useEffect(() => {
    const fetchCoupon = async () => {
      // Verifica se estamos no lado do cliente
      if (typeof window === 'undefined') return;

      // REMOVIDO: Controle de frequência que usava localStorage.
      // Agora, a verificação sempre prosseguirá para buscar o cupom.

      // Tenta buscar o cupom principal do backend
      try {
        const response = await api.get('/cupons/principal'); // Novo endpoint no backend
        if (response.data.cupomPrincipal) {
          setCoupon(response.data.cupomPrincipal);
          setIsOpen(true); // Abre o pop-up
          // REMOVIDO: A linha que marcava o pop-up como exibido no localStorage.
        }
      } catch (err) {
        console.error("Erro ao buscar cupom principal:", err);
        setError("Não foi possível carregar o cupom promocional.");
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeno atraso para o pop-up não aparecer instantaneamente na entrada
    const timer = setTimeout(() => {
      fetchCoupon();
    }, 1500); // 1.5 segundos de atraso

    return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
  }, []);

  // 2. Lógica para fechar o pop-up ao clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Previne o scroll do body quando o modal está aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Restaura o scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 3. Função para copiar o código do cupom
  const handleCopyCode = () => {
    if (coupon?.codigo) {
      navigator.clipboard.writeText(coupon.codigo)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000); // Feedback "Copiado!" por 2s
        })
        .catch(err => {
          console.error('Falha ao copiar:', err);
          alert('Não foi possível copiar o código. Por favor, copie manualmente: ' + coupon.codigo);
        });
    }
  };

  // Não renderiza nada se estiver carregando, não tiver cupom ou não estiver aberto
  if (isLoading || !coupon || !isOpen) {
    return null;
  }

  // Formatar o valor do cupom para exibição
  const formattedValue = coupon.tipo === 'percentual'
    ? `${parseFloat(coupon.valor).toFixed(0)}% OFF`
    : `R$ ${parseFloat(coupon.valor).toFixed(2).replace('.', ',')} OFF`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={popupRef}
            className={styles.popupContainer}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Botão de Fechar */}
            <button onClick={() => setIsOpen(false)} className={styles.closeButton} aria-label="Fechar">
              <BsX />
            </button>

            {/* Elementos Decorativos */}
            <Image src="/imagens/estrela2.svg" alt="" width={60} height={60} className={`${styles.decorativeElement} ${styles.star1}`} />
            <Image src="/imagens/lapisduplo.svg" alt="" width={50} height={50} className={`${styles.decorativeElement} ${styles.pencil1}`} />
            <HiOutlineSparkles className={`${styles.decorativeElement} ${styles.sparkle1}`} />

            {/* Ícone Principal do Cupom */}
            <div className={styles.mainIconWrapper}>
              <RiCoupon3Line className={styles.mainIcon} />
            </div>

            {/* Título e Descrição */}
            <h2 className={styles.popupTitle}>
              Ganhe {formattedValue} na sua próxima compra!
            </h2>
            <p className={styles.popupDescription}>
              Use este cupom exclusivo e renove seu guarda-roupa com estilo e consciência.
            </p>

            {/* Código do Cupom */}
            <div className={styles.couponCodeContainer}>
              <span className={styles.couponCode}>{coupon.codigo}</span>
              <motion.button
                className={styles.copyButton}
                onClick={handleCopyCode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </motion.button>
            </div>

            {/* CTA para o Catálogo */}
            <motion.a
              href="/catalog" // Link para a página do catálogo
              className={styles.catalogLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(false)} // Fecha o pop-up ao clicar no link
            >
              Explorar Catálogo <BsStars />
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CouponPopup;