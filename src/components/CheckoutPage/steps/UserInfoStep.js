// src/components/CheckoutPage/steps/UserInfoStep.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../CheckoutPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// ── Busca endereço direto na ViaCEP (sem passar pelo backend) ───────────────
async function fetchViaCep(cep) {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) throw new Error('CEP inválido');
  const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!res.ok) throw new Error('Erro na consulta');
  const data = await res.json();
  if (data.erro) throw new Error('CEP não encontrado');
  return data; // { logradouro, bairro, localidade, uf, complemento }
}

// ── Máscara CEP: 00000-000 ───────────────────────────────────────────────────
function maskCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

const EMPTY_ADDR = { apelido: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' };

const UserInfoStep = ({
  onComplete,
  isAuthenticated,
  isAuthLoading,
  userAddresses,
  isLoadingAddresses,
  onLoginOrRegisterSuccess,
  initialCep,
  allCartItemsAreDigital,
}) => {
  const { login: authLogin, user: authUser } = useAuth();

  const [showAuthForms,  setShowAuthForms]  = useState(false);
  const [isLoginMode,    setIsLoginMode]    = useState(true);

  const [addrForm,       setAddrForm]       = useState({ ...EMPTY_ADDR, cep: initialCep || '' });
  const [selectedAddrId, setSelectedAddrId] = useState('');

  const [loginCreds,    setLoginCreds]    = useState({ email: '', senha: '' });
  const [registerCreds, setRegisterCreds] = useState({ nome: '', email: '', senha: '' });

  const [loginError,    setLoginError]    = useState('');
  const [registerError, setRegisterError] = useState('');
  const [formError,     setFormError]     = useState('');
  const [cepMsg,        setCepMsg]        = useState({ type: '', text: '' }); // type: 'loading'|'ok'|'error'
  const [processing,    setProcessing]    = useState(false);
  const cepTimer = useRef(null);

  // ── inicializa ao autenticar ─────────────────────────────────────────────
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      setShowAuthForms(false);
      if (userAddresses.length > 0) {
        const principal = userAddresses.find(a => a.principal) || userAddresses[0];
        setSelectedAddrId(String(principal.id));
        setAddrForm({
          apelido: principal.apelido || '', cep: principal.cep || '',
          rua: principal.rua || '', numero: principal.numero || '',
          complemento: principal.complemento || '', bairro: principal.bairro || '',
          cidade: principal.cidade || '', estado: principal.estado || '',
        });
      } else {
        setSelectedAddrId('new');
        setAddrForm({ ...EMPTY_ADDR, cep: initialCep || '' });
      }
    } else {
      setShowAuthForms(true);
      setAddrForm({ ...EMPTY_ADDR, cep: initialCep || '' });
    }
  }, [isAuthenticated, isAuthLoading, userAddresses, initialCep]);

  // ── troca login ↔ cadastro ─────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated && showAuthForms) {
      setAddrForm({ ...EMPTY_ADDR, cep: initialCep || '' });
      setCepMsg({ type: '', text: '' });
    }
  }, [isLoginMode, isAuthenticated, showAuthForms, initialCep]);

  // ── CEP: busca automática com debounce 500ms ──────────────────────────────
  const handleCepChange = (e) => {
    const masked = maskCep(e.target.value);
    setAddrForm(prev => ({ ...prev, cep: masked, rua: '', bairro: '', cidade: '', estado: '' }));
    setCepMsg({ type: '', text: '' });

    const digits = masked.replace(/\D/g, '');
    clearTimeout(cepTimer.current);
    if (digits.length === 8) {
      setCepMsg({ type: 'loading', text: 'Buscando endereço…' });
      cepTimer.current = setTimeout(async () => {
        try {
          const d = await fetchViaCep(digits);
          setAddrForm(prev => ({
            ...prev,
            rua:         d.logradouro || '',
            bairro:      d.bairro     || '',
            cidade:      d.localidade || '',
            estado:      d.uf         || '',
            complemento: d.complemento || prev.complemento,
          }));
          setCepMsg({ type: 'ok', text: '✓ Endereço encontrado' });
        } catch {
          setCepMsg({ type: 'error', text: 'CEP não encontrado. Preencha manualmente.' });
        }
      }, 500);
    }
  };

  const handleAddrChange = (e) => {
    const { name, value } = e.target;
    setAddrForm(prev => ({ ...prev, [name]: value }));
  };

  // ── selecionar endereço existente ─────────────────────────────────────────
  const handleSelectAddr = (e) => {
    const id = e.target.value;
    setSelectedAddrId(id);
    if (id === 'new') {
      setAddrForm({ ...EMPTY_ADDR, cep: initialCep || '' });
      setCepMsg({ type: '', text: '' });
    } else {
      const a = userAddresses.find(x => String(x.id) === id);
      if (a) setAddrForm({
        apelido: a.apelido || '', cep: a.cep || '', rua: a.rua || '',
        numero: a.numero || '', complemento: a.complemento || '',
        bairro: a.bairro || '', cidade: a.cidade || '', estado: a.estado || '',
      });
    }
  };

  // ── auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setProcessing(true); setLoginError('');
    try {
      const res = await api.post('/auth/login', loginCreds);
      authLogin(res.data.usuario, res.data.token, null);
      onLoginOrRegisterSuccess();
    } catch (err) {
      setLoginError(err.response?.data?.erro || 'Credenciais inválidas.');
    } finally { setProcessing(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setProcessing(true); setRegisterError('');
    try {
      const res = await api.post('/auth/register', registerCreds);
      authLogin(res.data.usuario, res.data.token, null);
      onLoginOrRegisterSuccess();
    } catch (err) {
      setRegisterError(err.response?.data?.erro || 'Erro no cadastro.');
    } finally { setProcessing(false); }
  };

  // ── submit principal ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Pedido 100% digital
    if (allCartItemsAreDigital) {
      if (!isAuthenticated && (!registerCreds.nome || !registerCreds.email)) {
        setFormError('Informe seu nome e e-mail para continuar.');
        return;
      }
      onComplete({ nome: authUser?.nome || registerCreds.nome, email: authUser?.email || registerCreds.email });
      return;
    }

    // Usar endereço existente
    if (isAuthenticated && userAddresses.length > 0 && selectedAddrId !== 'new') {
      const a = userAddresses.find(x => String(x.id) === selectedAddrId);
      if (!a) { setFormError('Endereço selecionado não encontrado.'); return; }
      if (!a.principal) {
        try { await api.post(`/enderecos/${a.id}/principal`); } catch (_) {}
      }
      onComplete({ nome: authUser?.nome, email: authUser?.email, ...a });
      return;
    }

    // Validar novo endereço
    const cepDigits = addrForm.cep.replace(/\D/g, '');
    if (cepDigits.length !== 8)  { setFormError('CEP inválido.'); return; }
    if (!addrForm.rua)            { setFormError('Informe a rua.'); return; }
    if (!addrForm.numero)         { setFormError('Informe o número.'); return; }
    if (!addrForm.bairro)         { setFormError('Informe o bairro.'); return; }
    if (!addrForm.cidade)         { setFormError('Informe a cidade.'); return; }
    if (!addrForm.estado)         { setFormError('Informe o estado.'); return; }
    if (!isAuthenticated && (!registerCreds.nome || !registerCreds.email)) {
      setFormError('Informe seu nome e e-mail para continuar.'); return;
    }

    const payload = { ...addrForm, cep: cepDigits };

    if (isAuthenticated) {
      setProcessing(true);
      try {
        const principal = userAddresses.length === 0 ||
          e.target.elements['principal-checkbox']?.checked || false;
        const res = await api.post('/enderecos', { ...payload, principal });
        onLoginOrRegisterSuccess();
        onComplete({ nome: authUser?.nome, email: authUser?.email, ...res.data });
      } catch (err) {
        setFormError(err.response?.data?.erro || 'Erro ao salvar endereço.');
      } finally { setProcessing(false); }
    } else {
      onComplete({ nome: registerCreds.nome, email: registerCreds.email, ...payload });
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (isAuthLoading) return <p className={styles.loadingText}>Verificando seus dados…</p>;

  // Formulário de endereço (comum a autenticado e visitante)
  const addrFormEl = (
    <div>
      <h4 className={styles.subheading}>Detalhes do Endereço</h4>

      <div className={styles.formGroup}>
        <label htmlFor="addr-apelido">Apelido (ex: Casa, Trabalho)</label>
        <input id="addr-apelido" name="apelido" value={addrForm.apelido} onChange={handleAddrChange} placeholder="Casa" />
      </div>

      {/* CEP com busca automática */}
      <div className={styles.formGroup}>
        <label htmlFor="addr-cep">CEP *</label>
        <input
          id="addr-cep" name="cep"
          value={addrForm.cep}
          onChange={handleCepChange}
          maxLength={9}
          placeholder="00000-000"
          required
          style={{ background: cepMsg.type === 'loading' ? '#f9fafb' : undefined }}
        />
        {cepMsg.text && (
          <p style={{
            fontSize: '0.78rem', marginTop: '0.3rem',
            color: cepMsg.type === 'ok' ? '#059669' : cepMsg.type === 'error' ? '#dc2626' : '#6b7280',
          }}>
            {cepMsg.type === 'loading' && <span style={{ marginRight: 4 }}>⏳</span>}
            {cepMsg.text}
          </p>
        )}
      </div>

      {/* Rua */}
      <div className={styles.formGroup}>
        <label htmlFor="addr-rua">Rua / Logradouro *</label>
        <input id="addr-rua" name="rua" value={addrForm.rua} onChange={handleAddrChange} required placeholder="Preenchido automaticamente pelo CEP" />
      </div>

      {/* Número + Complemento */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="addr-numero">Número *</label>
          <input id="addr-numero" name="numero" value={addrForm.numero} onChange={handleAddrChange} required placeholder="123" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="addr-complemento">Complemento (Opcional)</label>
          <input id="addr-complemento" name="complemento" value={addrForm.complemento} onChange={handleAddrChange} placeholder="Apto, Bloco…" />
        </div>
      </div>

      {/* Bairro + Cidade */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="addr-bairro">Bairro *</label>
          <input id="addr-bairro" name="bairro" value={addrForm.bairro} onChange={handleAddrChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="addr-cidade">Cidade *</label>
          <input id="addr-cidade" name="cidade" value={addrForm.cidade} onChange={handleAddrChange} required />
        </div>
      </div>

      {/* Estado */}
      <div className={styles.formGroup} style={{ maxWidth: 120 }}>
        <label htmlFor="addr-estado">Estado (UF) *</label>
        <input id="addr-estado" name="estado" value={addrForm.estado} onChange={handleAddrChange} maxLength={2} required placeholder="SP" />
      </div>

      {isAuthenticated && (selectedAddrId === 'new' || userAddresses.length === 0) && (
        <div className={styles.checkboxGroup}>
          <input type="checkbox" id="principal-checkbox" name="principal" defaultChecked={userAddresses.length === 0} />
          <label htmlFor="principal-checkbox">Tornar este o endereço principal</label>
        </div>
      )}
    </div>
  );

  // ── Visitante não autenticado com formulários de auth ─────────────────────
  if (!isAuthenticated && showAuthForms) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={isLoginMode ? 'login' : 'register'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={styles.loginToggle}>
            <p>Já tem uma conta?</p>
            <button type="button" onClick={() => setIsLoginMode(true)}  disabled={processing}>Entre</button>
            <p>Ou, é novo por aqui?</p>
            <button type="button" onClick={() => setIsLoginMode(false)} disabled={processing}>Cadastre-se</button>
          </div>

          {isLoginMode ? (
            <form onSubmit={handleLogin}>
              <h4 className={styles.subheading}>Entrar para Continuar</h4>
              <div className={styles.formGroup}>
                <label>E-mail</label>
                <input type="email" name="email" value={loginCreds.email} onChange={e => setLoginCreds(p => ({...p, email: e.target.value}))} required />
              </div>
              <div className={styles.formGroup}>
                <label>Senha</label>
                <input type="password" name="senha" value={loginCreds.senha} onChange={e => setLoginCreds(p => ({...p, senha: e.target.value}))} required />
              </div>
              {loginError && <p className={styles.errorMessage}>{loginError}</p>}
              <button type="submit" className={styles.loginButton} disabled={processing}>{processing ? 'Entrando…' : 'Entrar'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h4 className={styles.subheading}>Cadastre-se para Continuar</h4>
              <div className={styles.formGroup}>
                <label>Seu Nome</label>
                <input type="text" value={registerCreds.nome} onChange={e => setRegisterCreds(p => ({...p, nome: e.target.value}))} required />
              </div>
              <div className={styles.formGroup}>
                <label>E-mail</label>
                <input type="email" value={registerCreds.email} onChange={e => setRegisterCreds(p => ({...p, email: e.target.value}))} required />
              </div>
              <div className={styles.formGroup}>
                <label>Crie uma Senha</label>
                <input type="password" value={registerCreds.senha} onChange={e => setRegisterCreds(p => ({...p, senha: e.target.value}))} required />
              </div>
              {registerError && <p className={styles.errorMessage}>{registerError}</p>}
              <button type="submit" className={styles.loginButton} disabled={processing}>{processing ? 'Cadastrando…' : 'Criar Conta'}</button>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Formulário principal (autenticado ou visitante confirmado) ─────────────
  return (
    <form onSubmit={handleSubmit}>
      <h4 className={styles.subheading}>Informações de Contato e Endereço de Entrega</h4>

      {isAuthenticated ? (
        <p className={styles.infoText}>
          Você está logado como <strong>{authUser?.nome}</strong> ({authUser?.email}).{' '}
          Os dados de contato serão vinculados à sua conta.
        </p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.formGroup}>
            <label>Seu Nome *</label>
            <input type="text" value={registerCreds.nome} onChange={e => setRegisterCreds(p => ({...p, nome: e.target.value}))} required />
          </div>
          <div className={styles.formGroup}>
            <label>E-mail para Contato *</label>
            <input type="email" value={registerCreds.email} onChange={e => setRegisterCreds(p => ({...p, email: e.target.value}))} required />
          </div>
        </motion.div>
      )}

      {!allCartItemsAreDigital && (
        <>
          {isLoadingAddresses ? (
            <p className={styles.loadingText}>Carregando endereços…</p>
          ) : isAuthenticated && userAddresses.length > 0 ? (
            <div className={styles.formGroup}>
              <label>Selecione um Endereço</label>
              <select className={styles.selectInput} value={selectedAddrId} onChange={handleSelectAddr}>
                {userAddresses.map(a => (
                  <option key={a.id} value={String(a.id)}>
                    {a.apelido || `${a.rua}, ${a.numero}`} — {a.cep}{a.principal ? ' (Principal)' : ''}
                  </option>
                ))}
                <option value="new">+ Adicionar Novo Endereço</option>
              </select>
            </div>
          ) : null}

          {(selectedAddrId === 'new' || (isAuthenticated && userAddresses.length === 0) || !isAuthenticated) && addrFormEl}
        </>
      )}

      {formError && <p className={styles.errorMessage}>{formError}</p>}

      <div className={styles.stepActions}>
        <button type="submit" className={styles.nextButton} disabled={processing || cepMsg.type === 'loading'}>
          {processing ? 'Processando…' : 'Confirmar Endereço e Continuar'}
        </button>
      </div>
    </form>
  );
};

export default UserInfoStep;
