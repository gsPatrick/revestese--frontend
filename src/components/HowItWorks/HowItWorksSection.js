'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './HowItWorksSection.module.css';
import { GiSewingNeedle, GiMagnifyingGlass, GiCardboardBox } from 'react-icons/gi';
import { FaRecycle } from 'react-icons/fa';

const steps = [
  {
    number: '01',
    icon: <GiSewingNeedle />,
    title: 'Curadoria',
    desc: 'Nossa equipe seleciona cada peça com critério — verificando estado, caimento e autenticidade antes de qualquer coisa.',
  },
  {
    number: '02',
    icon: <GiMagnifyingGlass />,
    title: 'Verificação',
    desc: 'Inspecionamos costura, tecido e acabamento. Só entra no acervo o que aprovamos com orgulho.',
  },
  {
    number: '03',
    icon: <GiCardboardBox />,
    title: 'Entrega',
    desc: 'Embalamos com cuidado e enviamos para todo o Brasil. Sua peça chega pronta para uma nova história.',
  },
  {
    number: '04',
    icon: <FaRecycle />,
    title: 'Circularidade',
    desc: 'Quando quiser renovar, devolva ou consigne conosco. O ciclo continua — e o planeta agradece.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90 } },
};

const HowItWorksSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Transparência total</p>
        <h2 className={styles.title}>Como funciona o Reveste-se</h2>
      </div>

      <motion.div
        className={styles.stepsGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {steps.map((step, i) => (
          <motion.div key={i} className={styles.stepCard} variants={itemVariants}>
            <span className={styles.stepNumber}>{step.number}</span>
            <div className={styles.stepIcon}>{step.icon}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>

            {/* Connector line (not on last) */}
            {i < steps.length - 1 && <div className={styles.connector} />}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HowItWorksSection;
