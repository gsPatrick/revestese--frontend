'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import styles from './configuracoes.module.css';
import { BsPerson, BsShieldLock, BsCheckCircle, BsExclamationCircle, BsTruck } from 'react-icons/bs';

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.toastError : styles.toastSuccess}`}>
      {type === 'error' ? <BsExclamationCircle /> : <BsCheckCircle />}
      <span>{msg}</span>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [user,    setUser]    = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  // Perfil
  const [nome,      setNome]      = useState('');
  const [email,     setEmail]     = useState('');
  const [savingP,   setSavingP]   = useState(false);

  // Senha
  const [senhaAtual,  setSenhaAtual]  = useState('');
  const [novaSenha,   setNovaSenha]   = useState('');
  const [confirmarS,  setConfirmarS]  = useState('');
  const [savingS,     setSavingS]     = useState(false);

  // Frete Grátis
  const [freteGratis,   setFreteGratis]   = useState(false);
  const [savingFrete,   setSavingFrete]   = useState(false);

  const notify = (msg, type = 'success') => setToast({ msg, type });

  const headers = () => {
    const token = localStorage.getItem('reveste_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    Promise.all([
      api.get('/usuarios/perfil', { headers: headers() }),
      api.get('/configuracoes/loja/publicas'),
    ]).then(([perfil, cfg]) => {
      setNome(perfil.data.nome || '');
      setEmail(perfil.data.email || '');
      setUser(perfil.data);
      setFreteGratis(cfg.data.FRETE_GRATIS === true || cfg.data.FRETE_GRATIS === 'true');
    }).catch(() => notify('Erro ao carregar configurações', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSavePerfil = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return notify('Nome e e-mail são obrigatórios', 'error');
    setSavingP(true);
    try {
      const r = await api.put('/usuarios/perfil', { nome, email }, { headers: headers() });
      // Atualiza user no localStorage
      const stored = JSON.parse(localStorage.getItem('reveste_user') || '{}');
      localStorage.setItem('reveste_user', JSON.stringify({ ...stored, nome: r.data.nome || nome, email: r.data.email || email }));
      notify('Perfil atualizado com sucesso!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao salvar perfil';
      notify(msg, 'error');
    } finally { setSavingP(false); }
  };

  const handleSaveSenha = async (e) => {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) return notify('Preencha todos os campos', 'error');
    if (novaSenha.length < 6) return notify('A nova senha deve ter no mínimo 6 caracteres', 'error');
    if (novaSenha !== confirmarS) return notify('As senhas não coincidem', 'error');
    setSavingS(true);
    try {
      await api.put('/usuarios/perfil/alterar-senha', { senhaAtual, novaSenha }, { headers: headers() });
      notify('Senha alterada com sucesso!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarS('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao alterar senha. Verifique a senha atual.';
      notify(msg, 'error');
    } finally { setSavingS(false); }
  };

  const handleToggleFreteGratis = async () => {
    const novoValor = !freteGratis;
    setSavingFrete(true);
    try {
      await api.put('/configuracoes/loja/FRETE_GRATIS', {
        valor: String(novoValor),
        tipo: 'booleano',
        descricao: 'Ativar frete grátis para todos os pedidos',
      }, { headers: headers() });
      setFreteGratis(novoValor);
      notify(novoValor ? 'Frete grátis ativado! O banner já está visível no site.' : 'Frete grátis desativado.');
    } catch {
      notify('Erro ao alterar configuração de frete', 'error');
    } finally { setSavingFrete(false); }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.page}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className={styles.header}>
        <h1 className={styles.title}>Configurações da Conta</h1>
        <p className={styles.sub}>Gerencie seus dados de acesso ao painel administrativo</p>
      </div>

      <div className={styles.grid}>

        {/* ── Frete Grátis ── */}
        <section className={`${styles.card} ${styles.freteCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: freteGratis ? '#ecfdf5' : '#f3f4f6', color: freteGratis ? '#10b981' : '#9ca3af' }}>
              <BsTruck />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className={styles.cardTitle}>Frete Grátis</h2>
              <p className={styles.cardDesc}>
                {freteGratis
                  ? 'Ativo — todos os pedidos estão com frete grátis e o banner está visível no site.'
                  : 'Inativo — o frete normal está sendo cobrado nos pedidos.'}
              </p>
            </div>
            <button
              onClick={handleToggleFreteGratis}
              disabled={savingFrete}
              className={`${styles.toggle} ${freteGratis ? styles.toggleOn : styles.toggleOff}`}
              aria-label="Alternar frete grátis"
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {freteGratis && (
            <div className={styles.freteAlert}>
              <span className={styles.freteAlertDot} />
              O banner de <strong>Frete Grátis</strong> está sendo exibido no topo do site agora.
              Para desativar, clique no botão acima.
            </div>
          )}
        </section>

        {/* ── Perfil ── */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}><BsPerson /></div>
            <div>
              <h2 className={styles.cardTitle}>Dados do Perfil</h2>
              <p className={styles.cardDesc}>Atualize seu nome e endereço de e-mail</p>
            </div>
          </div>

          <form onSubmit={handleSavePerfil} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Nome completo</label>
              <input
                className={styles.input}
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>E-mail de acesso</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              <span className={styles.hint}>Este e-mail é usado para fazer login no painel</span>
            </div>

            <div className={styles.actions}>
              <button className={styles.btn} type="submit" disabled={savingP}>
                {savingP ? 'Salvando...' : 'Salvar perfil'}
              </button>
            </div>
          </form>
        </section>

        {/* ── Senha ── */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: '#780e1a18', color: '#780e1a' }}><BsShieldLock /></div>
            <div>
              <h2 className={styles.cardTitle}>Alterar Senha</h2>
              <p className={styles.cardDesc}>Use uma senha forte com pelo menos 6 caracteres</p>
            </div>
          </div>

          <form onSubmit={handleSaveSenha} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Senha atual</label>
              <input
                className={styles.input}
                type="password"
                value={senhaAtual}
                onChange={e => setSenhaAtual(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nova senha</label>
              <input
                className={styles.input}
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirmar nova senha</label>
              <input
                className={`${styles.input} ${confirmarS && confirmarS !== novaSenha ? styles.inputError : ''}`}
                type="password"
                value={confirmarS}
                onChange={e => setConfirmarS(e.target.value)}
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                required
              />
              {confirmarS && confirmarS !== novaSenha && (
                <span className={styles.hintError}>As senhas não coincidem</span>
              )}
            </div>

            <div className={styles.strength}>
              <div
                className={styles.strengthBar}
                style={{
                  width: novaSenha.length === 0 ? '0%' : novaSenha.length < 6 ? '33%' : novaSenha.length < 10 ? '66%' : '100%',
                  background: novaSenha.length < 6 ? '#ef4444' : novaSenha.length < 10 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>

            <div className={styles.actions}>
              <button className={styles.btn} type="submit" disabled={savingS || !senhaAtual || !novaSenha || novaSenha !== confirmarS}>
                {savingS ? 'Alterando...' : 'Alterar senha'}
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}
