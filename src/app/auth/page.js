'use client';

import React, { useState } from 'react';
import styles from '@/components/AuthPage/AuthPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';

import LoginForm from '@/components/AuthPage/LoginForm';
import RegisterForm from '@/components/AuthPage/RegisterForm';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('login');

  const handleSocialLogin = (provider) => {
    alert(`Simulando login com ${provider}`);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.authCard}>
        {/* Coluna da Ilustração (Esquerda) */}
        <div className={styles.illustrationColumn}>
          {/* IMAGEM ATUALIZADA PARA A LOGO */}
          <Image 
            src="/logo.png"
            alt="Logo Reveste-se" 
            width={300} 
            height={300}
            className={styles.illustrationImage}
          />
          {/* TEXTO REMOVIDO PARA UM DESIGN MAIS LIMPO */}
        </div>

        {/* Coluna do Formulário (Direita) */}
        <div className={styles.formColumn}>
          <div className={styles.formWrapper}>
            <div className={styles.toggleButtons}>
              <button 
                onClick={() => setAuthMode('login')}
                className={authMode === 'login' ? styles.active : ''}
              >
                Login
                {authMode === 'login' && <motion.div className={styles.underline} layoutId="underline" />}
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={authMode === 'register' ? styles.active : ''}
              >
                Cadastro
                {authMode === 'register' && <motion.div className={styles.underline} layoutId="underline" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <LoginForm key="login" />
              ) : (
                <RegisterForm key="register" />
              )}
            </AnimatePresence>

            <div className={styles.socialLogin}>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}