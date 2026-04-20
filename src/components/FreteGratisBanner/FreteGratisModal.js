'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import styles from './FreteGratisModal.module.css';
import { BsTruck, BsX, BsArrowRight } from 'react-icons/bs';
import Link from 'next/link';

const STORAGE_KEY = 'rv_frete_modal_dismissed';

export default function FreteGratisModal() {
  const [ativo,   setAtivo]   = useState(false);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Só mostra uma vez por sessão (voltará na próxima abertura do navegador)
    const jaViu = sessionStorage.getItem(STORAGE_KEY);
    if (jaViu) return;

    api.get('/configuracoes/loja/publicas')
      .then(r => {
        const cfg = r.data;
        const freteGratis = cfg.FRETE_GRATIS === true || cfg.FRETE_GRATIS === 'true';
        if (freteGratis) {
          setAtivo(true);
          // Pequeno delay para não aparecer junto com o carregamento da página
          setTimeout(() => setVisivel(true), 1200);
        }
      })
      .catch(() => {});
  }, []);

  const fechar = () => {
    setVisivel(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  if (!ativo) return null;

  return (
    <AnimatePresence>
      {visivel && (
        <>
          {/* Backdrop + centralizador — o clique no fundo fecha o modal */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={fechar}
          >
          {/* Modal — stopPropagation evita que clique interno feche */}
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Promoção frete grátis"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button className={styles.closeBtn} onClick={fechar} aria-label="Fechar">
              <BsX />
            </button>

            {/* Decoração topo */}
            <div className={styles.topDecor}>
              <span className={styles.truckWrap}><BsTruck /></span>
            </div>

            <p className={styles.eyebrow}>PROMOÇÃO ESPECIAL</p>
            <h2 className={styles.title}>Frete Grátis<br />para todo o Brasil!</h2>
            <p className={styles.desc}>
              Por tempo limitado, todos os pedidos saem sem custo de frete.
              Aproveite para renovar seu guarda-roupa com mais economia.
            </p>

            <div className={styles.actions}>
              <Link href="/catalog" className={styles.ctaBtn} onClick={fechar}>
                Ver peças <BsArrowRight />
              </Link>
              <button className={styles.dismissBtn} onClick={fechar}>
                Fechar
              </button>
            </div>

            {/* Rodapé decorativo */}
            <p className={styles.fine}>Válido enquanto a promoção estiver ativa.</p>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
