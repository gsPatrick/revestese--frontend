'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CuradoriaSection.module.css';
import { GiHanger } from 'react-icons/gi';
import { BsArrowRight, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import api from '@/services/api';

const CONDITION_LABELS = {
  'novo com etiqueta': 'Novo c/ Etiqueta',
  'novo': 'Novo',
  'muito bom': 'Muito Bom',
  'bom': 'Bom Estado',
  'vintage': 'Vintage',
};

const CuradoriaSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    api.get('/produtos/lancamentos?limit=10')
      .then(res => {
        const formatted = res.data.map(p => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.nome,
          brand: p.marca || null,
          size: p.variacoes?.[0]?.tamanho || null,
          condition: CONDITION_LABELS[(p.condicao || '').toLowerCase()] || p.condicao || null,
          imageSrc: p.imagens?.[0] || null,
          href: `/product/${p.slug || p.id}`,
        }));
        setProducts(formatted);
      })
      .catch(err => console.error('Erro ao buscar recém chegados:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const scroll = (dir) => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.querySelector(`.${styles.card}`)?.offsetWidth || 280;
    trackRef.current.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
  };

  const skeletons = Array.from({ length: 5 });

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.eyebrow}>Acabou de chegar</p>
          <h2 className={styles.title}>Recém chegados</h2>
          <p className={styles.subtitle}>
            As últimas peças que entraram no nosso acervo — verificadas, fotografadas e prontas para encontrar um novo lar.
          </p>
        </div>
        <div className={styles.headRight}>
          <Link href="/catalogo" className={styles.viewAllLink}>
            Ver todo o acervo <BsArrowRight />
          </Link>
          <div className={styles.navButtons}>
            <button className={styles.navBtn} onClick={() => scroll(-1)} aria-label="Anterior">
              <BsChevronLeft />
            </button>
            <button className={styles.navBtn} onClick={() => scroll(1)} aria-label="Próximo">
              <BsChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <div ref={trackRef} className={styles.track}>
          {isLoading
            ? skeletons.map((_, i) => <div key={i} className={styles.cardSkeleton} />)
            : products.length === 0
            ? (
              <div className={styles.emptyState}>
                <GiHanger className={styles.emptyIcon} />
                <p>Novas peças chegam toda semana. Fique de olho!</p>
              </div>
            )
            : products.map((item, i) => (
              <motion.div
                key={item.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 90 }}
              >
                <Link href={item.href} className={styles.imageWrapper} aria-label={item.name}>
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.name}
                      fill
                      sizes="280px"
                      className={styles.cardImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <GiHanger className={styles.hangerIcon} />
                    </div>
                  )}
                  <span className={styles.cardTag}>Nova chegada</span>
                </Link>

                <div className={styles.cardBody}>
                  {(item.brand || item.size) && (
                    <p className={styles.cardBrand}>
                      {[item.brand, item.size].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <h3 className={styles.cardName}>{item.name}</h3>
                  {item.condition && (
                    <div className={styles.cardMeta}>
                      <span className={styles.conditionDot} />
                      <span className={styles.cardCondition}>{item.condition}</span>
                    </div>
                  )}
                  <Link href={item.href} className={styles.cardCta}>
                    Ver peça <BsArrowRight />
                  </Link>
                </div>
              </motion.div>
            ))
          }
        </div>
      </div>
    </section>
  );
};

export default CuradoriaSection;
