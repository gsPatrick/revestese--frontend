'use client';

import React, { useState } from 'react';
import styles from './ContactPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BsCheckCircleFill } from 'react-icons/bs';

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    // Simulação de envio para uma API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Aqui você faria a chamada fetch real
    console.log('Dados do formulário:', formData);
    
    setStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Volta para o estado 'idle' após alguns segundos
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className={styles.formContainer}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            className={styles.successMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BsCheckCircleFill />
            <h3>Mensagem Enviada!</h3>
            <p>Sua mensagem chegou até nós. Respondemos em até 24 horas!</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.formGroup}>
              <label htmlFor="name">Seu Nome</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Seu Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Assunto</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Sua Mensagem</label>
              <textarea id="message" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <motion.button
              type="submit"
              className={styles.submitButton}
              disabled={status === 'sending'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactForm;