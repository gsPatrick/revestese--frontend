'use client';

import React, { useState } from 'react';
import styles from './AuthPage.module.css';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const formVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const RegisterForm = () => {
  const [nome, setNome] = useState('');
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
      const response = await api.post('/auth/register', { nome, email, senha });
      // A API de registro já retorna o token e o usuário, então fazemos o login diretamente
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
        <label htmlFor="register-name">Seu Nome</label>
        <input 
          type="text" 
          id="register-name"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required 
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="register-email">Seu Email</label>
        <input 
          type="email" 
          id="register-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="register-password">Crie uma Senha</label>
        <input 
          type="password" 
          id="register-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required 
        />
      </div>
      {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
      <p className={styles.terms}>
        Ao se cadastrar, você concorda com nossos <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>.
      </p>
      <motion.button 
        type="submit" 
        className={styles.submitButton}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        {isLoading ? 'Criando conta...' : 'Criar Conta'}
      </motion.button>
    </motion.form>
  );
};

export default RegisterForm;