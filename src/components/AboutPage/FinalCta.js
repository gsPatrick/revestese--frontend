'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './FinalCta.module.css';
import { BsArrowRight } from 'react-icons/bs';

const FinalCta = () => {
  return (
    <section className={styles.section}>
      <div className={styles.bgImageWrapper}>
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80"
          alt="Moda circular — Reveste-se"
          fill
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.overlay} />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className={styles.eyebrow}>Pronta para começar?</p>
        <h2 className={styles.title}>
          Vista-se com propósito.<br />
          <em>Faça parte do movimento.</em>
        </h2>
        <p className={styles.body}>
          Explore o acervo, encontre sua próxima peça favorita ou consigne o que parou de usar. O Reveste-se existe para isso.
        </p>
        <div className={styles.buttons}>
          <Link href="/catalog" className={styles.btnPrimary}>
            Ver o acervo <BsArrowRight />
          </Link>
          <a
            href="https://wa.me/5511954728628?text=Ol%C3%A1%21+Quero+saber+mais+sobre+o+Reveste-se."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
          >
            Fale conosco
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCta;
