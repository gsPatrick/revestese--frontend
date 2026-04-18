'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './EditorialSection.module.css';

/* SVG icons inlined so não precisamos de dependências extras */
const ClothingOrbit = () => (
  <div className={styles.orbitScene}>
    {/* Anéis circulares decorativos */}
    <div className={`${styles.ring} ${styles.ring1}`} />
    <div className={`${styles.ring} ${styles.ring2}`} />
    <div className={`${styles.ring} ${styles.ring3}`} />

    {/* Centro — cabide */}
    <div className={styles.centerIcon}>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.hangerSvg}>
        <path d="M32 8a6 6 0 0 1 6 6c0 2.5-1.5 4.6-3.7 5.5L48 28H16L29.7 19.5A6 6 0 0 1 32 8z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 28c-6 4-9 8-5 13 2 2.5 5 3 8 3h26c3 0 6-.5 8-3 4-5 1-9-5-13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="8" r="2.5" fill="currentColor"/>
      </svg>
    </div>

    {/* Ícones orbitando — cada um tem posição CSS via custom property */}
    {[
      { icon: 'dress',   angle: 0,   label: 'Vestido' },
      { icon: 'jacket',  angle: 60,  label: 'Jaqueta' },
      { icon: 'pants',   angle: 120, label: 'Calça' },
      { icon: 'bag',     angle: 180, label: 'Bolsa' },
      { icon: 'blouse',  angle: 240, label: 'Blusa' },
      { icon: 'scarf',   angle: 300, label: 'Lenço' },
    ].map(({ icon, angle, label }) => (
      <div
        key={icon}
        className={styles.orbitItem}
        style={{ '--angle': `${angle}deg` }}
      >
        <div className={styles.orbitIcon}>
          <ClothingIcon type={icon} />
        </div>
      </div>
    ))}

    {/* Seta circular de reciclagem */}
    <svg className={styles.circularArrow} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 20 A80 80 0 1 1 20 100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <polygon points="18,88 28,100 8,100" fill="currentColor" />
    </svg>
  </div>
);

const ClothingIcon = ({ type }) => {
  const icons = {
    dress: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 3h10M11 3l-5 7h4v16h12V10h4l-5-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    jacket: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L8 8l-5 2v16h7V14h8v12h7V10l-5-2-3-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3h8M12 3v6M20 3v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    pants: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4h20v8l-4 16h-4l-2-10-2 10H10L6 12V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    bag: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12V9a6 6 0 0 1 12 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="4" y="12" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    blouse: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l-8 5 3 4 3-2v16h16V10l3 2 3-4-8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 3c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    scarf: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6c4-2 12 6 16 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 6l2 18c1 4 6 5 8 2l6-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

const EditorialSection = () => {
  return (
    <motion.section
      className={styles.editorialSection}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.leftBar} />

      {/* Copy */}
      <div className={styles.content}>
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Nossa filosofia
        </motion.p>

        <motion.h2
          className={styles.headline}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.7 }}
        >
          A Arte da<br />
          <span className={styles.highlightWord}>Renovação.</span>
        </motion.h2>

        <motion.p
          className={styles.body}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Cada peça no Reveste-se foi escolhida com intenção. Acreditamos que moda não precisa ser descartável — ela pode ser passada adiante, ressignificada, amada de novo. Comprando aqui, você desacelera, consome com propósito e faz parte de algo maior.
        </motion.p>

        <motion.div
          className={styles.stats}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          {[
            { value: '100%', label: 'Peças verificadas' },
            { value: '7×',   label: 'Mais sustentável' },
            { value: '0',    label: 'Desperdício' },
          ].map((stat, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Graphic panel */}
      <motion.div
        className={styles.graphicPanel}
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.9 }}
      >
        <ClothingOrbit />
        <p className={styles.graphicCaption}>Moda circular — cada peça encontra um novo lar</p>
      </motion.div>
    </motion.section>
  );
};

export default EditorialSection;
