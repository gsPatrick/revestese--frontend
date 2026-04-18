'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './NewsletterSection.module.css';
import { FaLeaf } from 'react-icons/fa';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          className={styles.copy}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <FaLeaf className={styles.leafIcon} />
          <p className={styles.eyebrow}>Novidades & Sustentabilidade</p>
          <h2 className={styles.title}>
            Moda com propósito<br />
            <span className={styles.highlight}>na sua caixa de entrada.</span>
          </h2>
          <p className={styles.desc}>
            Receba em primeira mão as novas chegadas, dicas de cuidado com peças vintage e um <strong>cupom de 10% off</strong> na sua primeira compra.
          </p>
        </motion.div>

        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {submitted ? (
            <div className={styles.success}>
              <FaLeaf />
              <p>Bem-vinda ao movimento! Verifique sua caixa de entrada.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label htmlFor="newsletter-email" className={styles.label}>
                Seu melhor e-mail
              </label>
              <div className={styles.inputRow}>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
                <button type="submit" className={styles.btn}>
                  Quero participar
                </button>
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <p className={styles.disclaimer}>
                Sem spam. Cancelamento em um clique. Privacidade garantida.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
