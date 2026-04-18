'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './OurMission.module.css';
import { FaRecycle, FaHeart, FaLeaf } from 'react-icons/fa';
import { GiHanger } from 'react-icons/gi';

const values = [
  {
    icon: <GiHanger />,
    title: 'Curadoria rigorosa',
    desc: 'Cada peça passa por avaliação de estado, caimento e autenticidade. Só entra no acervo o que aprovamos com orgulho.',
  },
  {
    icon: <FaRecycle />,
    title: 'Moda circular',
    desc: 'Acreditamos que roupa boa não tem prazo de validade. Nossa missão é manter cada peça viva pelo maior tempo possível.',
  },
  {
    icon: <FaLeaf />,
    title: 'Impacto real',
    desc: 'Uma peça comprada aqui economiza até 3.000 litros de água e evita quilos de CO₂ em comparação à roupa nova.',
  },
  {
    icon: <FaHeart />,
    title: 'Comunidade',
    desc: 'Somos feitos de pessoas que amam moda e se importam com o planeta. Cada cliente é parte ativa dessa corrente.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 85 } },
};

const OurMission = () => {
  return (
    <section className={styles.section}>
      {/* Image + copy split */}
      <div className={styles.storyBlock}>
        <motion.div
          className={styles.storyImage}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <Image
            src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&q=80"
            alt="Araras de roupas no brechó Reveste-se"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.storyImg}
          />
          <div className={styles.storyImageBadge}>
            <span className={styles.badgeYear}>2024</span>
            <span className={styles.badgeLabel}>Nossa fundação</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.storyCopy}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <p className={styles.eyebrow}>De onde viemos</p>
          <h2 className={styles.storyTitle}>
            Uma loja que<br />
            <span className={styles.highlight}>surgiu de uma frustração.</span>
          </h2>
          <p className={styles.storyText}>
            Cansadas de ver armários cheios de peças abandonadas e a indústria da moda produzindo cada vez mais sem responsabilidade, fundamos o Reveste-se com uma pergunta simples: <strong>e se cada peça pudesse ser amada de novo?</strong>
          </p>
          <p className={styles.storyText}>
            Começamos curadoriando peças de conhecidos, parentes e brechós locais. Hoje somos um acervo vivo de moda circular — com curadoria editorial, entrega para todo o Brasil e um compromisso real com o consumo consciente.
          </p>
          <div className={styles.storyStats}>
            {[
              { n: '500+', l: 'Peças no acervo' },
              { n: '300+', l: 'Clientes satisfeitas' },
              { n: '1 ton', l: 'De roupas reaproveitadas' },
            ].map((s, i) => (
              <div key={i} className={styles.storyStat}>
                <span className={styles.storyStatN}>{s.n}</span>
                <span className={styles.storyStatL}>{s.l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Values */}
      <div className={styles.valuesHeader}>
        <p className={styles.eyebrow}>O que nos guia</p>
        <h2 className={styles.valuesTitle}>Nossos valores</h2>
      </div>

      <motion.div
        className={styles.valuesGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {values.map((v, i) => (
          <motion.div key={i} className={styles.valueCard} variants={cardVariants}>
            <div className={styles.valueIcon}>{v.icon}</div>
            <h3 className={styles.valueTitle}>{v.title}</h3>
            <p className={styles.valueDesc}>{v.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default OurMission;
