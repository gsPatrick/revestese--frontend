'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from './FreteGratisBanner.module.css';
import { BsTruck, BsX } from 'react-icons/bs';

export default function FreteGratisBanner() {
  const [ativo,     setAtivo]     = useState(false);
  const [fechado,   setFechado]   = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    api.get('/configuracoes/loja/publicas')
      .then(r => {
        const cfg = r.data;
        // O serviço retorna booleano true quando tipo=booleano e valor='true'
        setAtivo(cfg.FRETE_GRATIS === true || cfg.FRETE_GRATIS === 'true');
      })
      .catch(() => {});
  }, []);

  if (!mounted || !ativo || fechado) return null;

  return (
    <div className={styles.banner} role="banner" aria-label="Promoção de frete grátis">
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.truck}><BsTruck /></span>
          <span className={styles.tag}>FRETE GRÁTIS</span>
        </div>
        <p className={styles.text}>
          Frete grátis em <strong>todos os pedidos</strong> para todo o Brasil!
          Aproveite enquanto dura.
        </p>
        <button
          className={styles.close}
          onClick={() => setFechado(true)}
          aria-label="Fechar banner"
        >
          <BsX />
        </button>
      </div>
    </div>
  );
}
