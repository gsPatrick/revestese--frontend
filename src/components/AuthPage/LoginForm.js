'use client';

import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const formVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, senha });
      login(response.data.usuario, response.data.token);
    } catch (err) {
      setError(err.response?.data?.erro || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
    >
      <div className={styles.formGroup}>
        <label htmlFor="login-email">Email</label>
        <input 
          type="email" 
          id="login-email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="login-password">Senha</label>
        <input 
          type="password" 
          id="login-password" 
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required 
        />
      </div>
      {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
      <a href="#" className={styles.forgotPassword}>Esqueceu a senha?</a>
      <motion.button 
        type="submit" 
        className={styles.submitButton}
        whileHover={{ scale: 1.03, filter: 'brightness(0.95)' }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;