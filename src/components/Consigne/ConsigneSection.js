'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './ConsigneSection.module.css';
import { BsArrowRight } from 'react-icons/bs';
import { GiHanger, GiSewingNeedle } from 'react-icons/gi';
import { FaLeaf, FaMoneyBillWave } from 'react-icons/fa';

const steps = [
  {
    icon: <GiHanger />,
    title: 'Selecione suas peças',
    desc: 'Escolha roupas em bom estado que você não usa mais. Aceitamos marcas variadas em ótimas condições.',
  },
  {
    icon: <GiSewingNeedle />,
    title: 'Enviamos ou buscamos',
    desc: 'Você pode trazer pessoalmente ou solicitar coleta. Nossa equipe avalia e fotografa cada peça.',
  },
  {
    icon: <FaMoneyBillWave />,
    title: 'Receba sua parte',
    desc: 'Quando sua peça for vendida, você recebe uma porcentagem. Simples, justo e transparente.',
  },
  {
    icon: <FaLeaf />,
    title: 'O ciclo continua',
    desc: 'Sua peça ganha um novo dono, você ganha crédito ou dinheiro, e o planeta ganha fôlego.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 85 } },
};

const ConsigneSection = () => {
  return (
    <section className={styles.section}>
      {/* Background pattern */}
      <div className={styles.bgPattern} aria-hidden="true" />

      <div className={styles.inner}>
        {/* Top: headline */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className={styles.eyebrow}>Faça parte do movimento</p>
          <h2 className={styles.title}>
            Sua peça merece<br />
            <span className={styles.highlight}>uma nova história.</span>
          </h2>
          <p className={styles.subtitle}>
            Consigne com o Reveste-se e transforme o que está parado no seu guarda-roupa em renda — e em impacto real.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className={styles.stepsGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((step, i) => (
            <motion.div key={i} className={styles.stepCard} variants={itemVariants}>
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepNumber}>0{i + 1}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <a
            href="https://wa.me/5511954728628?text=Ol%C3%A1%21+Quero+consignar+minhas+pe%C3%A7as+no+Reveste-se."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaPrimary}
          >
            Quero consignar agora <BsArrowRight />
          </a>
          <Link href="/catalogo" className={styles.ctaSecondary}>
            Ver o acervo
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ConsigneSection;
