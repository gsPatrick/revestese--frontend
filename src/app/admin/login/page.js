'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import styles from './login.module.css';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

export default function AdminLogin() {
  const router = useRouter();
  const [form,    setForm]    = useState({ email: '', senha: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('reveste_token');
    const user  = JSON.parse(localStorage.getItem('reveste_user') || '{}');
    if (token && user?.tipo === 'admin') router.replace('/admin/dashboard');
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, usuario } = res.data;
      if (usuario?.tipo !== 'admin') {
        setError('Acesso restrito a administradores.');
        return;
      }
      localStorage.setItem('reveste_token', token);
      localStorage.setItem('reveste_user', JSON.stringify(usuario));
      router.replace('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.erro || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Reveste-se" style={{ height: '80px', width: 'auto', objectFit: 'contain', marginBottom: '4px' }} />
          <span className={styles.logoBadge}>admin</span>
        </div>

        <h1 className={styles.title}>Entrar no painel</h1>
        <p className={styles.sub}>Acesso restrito à equipe administrativa.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@reveste-se.com.br"
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>
            <div className={styles.pwWrapper}>
              <input
                id="senha"
                type={showPw ? 'text' : 'password'}
                value={form.senha}
                onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                placeholder="••••••••"
                required
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
                {showPw ? <BsEyeSlash /> : <BsEye />}
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
