'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './AboutHero.module.css';

const AboutHero = () => {
  return (
    <section className={styles.heroSection}>
      {/* Background image with overlay */}
      <div className={styles.bgImageWrapper}>
        <Image
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1800&q=80"
          alt="Roupas em araras — Reveste-se"
          fill
          priority
          className={styles.bgImage}
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Nossa história
        </motion.p>

        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Nascemos para dar às<br />
          roupas uma<br />
          <em>segunda chance.</em>
        </motion.h1>

        <motion.p
          className={styles.sub}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7 }}
        >
          O Reveste-se é um brechó premium de moda circular criado por pessoas que acreditam que consumir bem é tão importante quanto consumir menos.
        </motion.p>

        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>Role para conhecer</span>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero;
