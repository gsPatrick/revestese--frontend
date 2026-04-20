'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import styles from './configuracoes.module.css';
import { BsPerson, BsShieldLock, BsCheckCircle, BsExclamationCircle, BsTruck, BsCameraVideo, BsCloudUpload } from 'react-icons/bs';

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

  // Upload de vídeo
  const [videoFile,     setVideoFile]     = useState(null);
  const [uploadPhase,   setUploadPhase]   = useState('idle'); // idle | uploading | encoding | done | error
  const [uploadPct,     setUploadPct]     = useState(0);
  const [encodePct,     setEncodePct]     = useState(0);
  const [videoJobId,    setVideoJobId]    = useState(null);
  const [videoErrMsg,   setVideoErrMsg]   = useState('');
  const pollRef = useRef(null);

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

  /* ── Upload de vídeo ── */
  const handleVideoUpload = () => {
    if (!videoFile) return notify('Selecione um arquivo de vídeo', 'error');

    setUploadPhase('uploading');
    setUploadPct(0);
    setEncodePct(0);
    setVideoErrMsg('');

    const token = localStorage.getItem('reveste_token');
    const formData = new FormData();
    formData.append('video', videoFile);

    const xhr = new XMLHttpRequest();

    // Progresso de upload (fase 1)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const { jobId } = JSON.parse(xhr.responseText);
        setVideoJobId(jobId);
        setUploadPhase('encoding');
        setEncodePct(0);
        // Inicia polling do progresso de encoding (fase 2)
        pollRef.current = setInterval(async () => {
          try {
            const r = await api.get(`/admin/videos/status/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
            const { progress, status, error } = r.data;
            setEncodePct(progress || 0);
            if (status === 'done') {
              clearInterval(pollRef.current);
              setUploadPhase('done');
              setVideoFile(null);
              notify('Vídeo atualizado com sucesso! Ele já está no ar.');
            } else if (status === 'error') {
              clearInterval(pollRef.current);
              setUploadPhase('error');
              setVideoErrMsg(error || 'Erro no encoding');
            }
          } catch (_) {}
        }, 2000);
      } else {
        setUploadPhase('error');
        setVideoErrMsg('Erro ao enviar o arquivo.');
      }
    };

    xhr.onerror = () => { setUploadPhase('error'); setVideoErrMsg('Erro de rede ao enviar.'); };

    xhr.open('POST', 'https://geral-revestese-api.r954jc.easypanel.host/api/admin/videos/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  // Limpa polling ao desmontar
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

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

        {/* ── Vídeo da seção principal ── */}
        <section className={`${styles.card} ${styles.videoCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon} style={{ background: '#0f0f0f18', color: '#1a1a1a' }}>
              <BsCameraVideo />
            </div>
            <div style={{ flex: 1 }}>
              <h2 className={styles.cardTitle}>Vídeo da Seção Principal</h2>
              <p className={styles.cardDesc}>
                Substitua o vídeo exibido na página inicial. O encoding acontece no servidor automaticamente.
              </p>
            </div>
          </div>

          {/* Área de seleção */}
          {uploadPhase === 'idle' || uploadPhase === 'done' || uploadPhase === 'error' ? (
            <div className={styles.videoUploadArea}>
              <label className={styles.videoFileLabel}>
                <BsCloudUpload className={styles.videoUploadIcon} />
                <span className={styles.videoFileName}>
                  {videoFile ? videoFile.name : 'Clique para selecionar o vídeo'}
                </span>
                <span className={styles.videoFileHint}>MP4, MOV, AVI — até 1 GB</span>
                <input
                  type="file"
                  accept="video/*"
                  className={styles.videoFileInput}
                  onChange={e => { setVideoFile(e.target.files[0] || null); setUploadPhase('idle'); }}
                />
              </label>

              {uploadPhase === 'error' && (
                <p className={styles.videoError}><BsExclamationCircle /> {videoErrMsg}</p>
              )}
              {uploadPhase === 'done' && (
                <p className={styles.videoDone}><BsCheckCircle /> Vídeo atualizado com sucesso!</p>
              )}

              <div className={styles.actions}>
                <button
                  className={styles.btn}
                  onClick={handleVideoUpload}
                  disabled={!videoFile}
                >
                  Enviar e processar
                </button>
              </div>
            </div>
          ) : null}

          {/* Fase 1: upload */}
          {uploadPhase === 'uploading' && (
            <div className={styles.videoProgress}>
              <p className={styles.videoProgressLabel}>
                Enviando arquivo… <strong>{uploadPct}%</strong>
              </p>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${uploadPct}%` }} />
              </div>
              <p className={styles.videoProgressHint}>Aguarde, não feche esta página.</p>
            </div>
          )}

          {/* Fase 2: encoding */}
          {uploadPhase === 'encoding' && (
            <div className={styles.videoProgress}>
              <p className={styles.videoProgressLabel}>
                Processando com ffmpeg… <strong>{encodePct}%</strong>
              </p>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressBar} ${styles.progressBarEncoding}`}
                  style={{ width: `${encodePct}%` }}
                />
              </div>
              <p className={styles.videoProgressHint}>
                Você pode navegar pelo painel — o processamento continua em background.
              </p>
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
            <div className={styles.cardIcon} style={{ background: '#11111118', color: '#111111' }}><BsShieldLock /></div>
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
