'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './ComfortSection.module.css';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80',
    alt: 'Looks curados — Reveste-se',
    span: 'tall',
  },
  {
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=700&q=80',
    alt: 'Moda circular — Reveste-se',
    span: 'normal',
  },
  {
    src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80',
    alt: 'Peças únicas selecionadas',
    span: 'normal',
  },
];

const ComfortSection = () => {
  return (
    <section className={styles.section}>
      {/* Photo collage */}
      <motion.div
        className={styles.collage}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        {images.map((img, i) => (
          <motion.div
            key={i}
            className={`${styles.collageItem} ${styles[img.span]}`}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.7 }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={styles.collageImg}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Copy */}
      <motion.div
        className={styles.copy}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className={styles.eyebrow}>Nossa promessa</p>
        <h2 className={styles.title}>
          Cada peça conta.<br />
          <span className={styles.highlight}>Cada escolha importa.</span>
        </h2>
        <p className={styles.body}>
          Quando você compra no Reveste-se, você não está apenas adquirindo uma roupa — está fazendo parte de um movimento que acredita que beleza e responsabilidade andam juntas. Nossas peças chegam verificadas, limpas e com história.
        </p>
        <p className={styles.body}>
          Nosso processo de curadoria garante que apenas peças em ótimo estado chegam até você. Fotografamos com cuidado, descrevemos com honestidade e embalamos com carinho.
        </p>
      </motion.div>
    </section>
  );
};

export default ComfortSection;
