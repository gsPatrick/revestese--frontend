'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import api from '@/services/api';
import styles from '../shared.module.css';
import catStyles from './categorias.module.css';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheckLg, BsCloudUpload } from 'react-icons/bs';

// ── Leque de ícones disponíveis ──────────────────────────────────────────────
import {
  GiHanger, GiDress, GiTrousers, GiRunningShoe, GiAmpleDress,
  GiMonclerJacket, GiBelt, GiNecklace, GiSunglasses,
  GiBriefcase, GiWinterHat, GiSocks, GiWool,
} from 'react-icons/gi';
import {
  BsHandbag, BsBag, BsShop,
} from 'react-icons/bs';
import { FaTshirt, FaHatCowboy, FaShoePrints, FaChild } from 'react-icons/fa';
import { MdOutlineCheckroom, MdOutlineSpa } from 'react-icons/md';

export const ICON_MAP = {
  GiHanger:        { component: GiHanger,       label: 'Cabide'     },
  GiDress:         { component: GiDress,         label: 'Vestido'    },
  GiAmpleDress:    { component: GiAmpleDress,    label: 'Saia'       },
  GiAmpleDressFem: { component: GiAmpleDress,    label: 'Moda Fem.'  },
  GiTrousers:      { component: GiTrousers,      label: 'Calça'      },
  FaTshirt:        { component: FaTshirt,         label: 'Camiseta'   },
  GiMonclerJacket: { component: GiMonclerJacket, label: 'Jaqueta'    },
  GiRunningShoe:   { component: GiRunningShoe,   label: 'Tênis'      },
  FaShoePrints:    { component: FaShoePrints,    label: 'Calçado'    },
  BsHandbag:       { component: BsHandbag,       label: 'Bolsa'      },
  BsBag:           { component: BsBag,           label: 'Sacola'     },
  GiBelt:          { component: GiBelt,          label: 'Cinto'      },
  GiNecklace:      { component: GiNecklace,      label: 'Colar'      },
  GiSunglasses:    { component: GiSunglasses,    label: 'Óculos'     },
  FaHatCowboy:     { component: FaHatCowboy,     label: 'Chapéu'     },
  GiWinterHat:     { component: GiWinterHat,     label: 'Gorro'      },
  GiSocks:         { component: GiSocks,         label: 'Meias'      },
  GiBriefcase:     { component: GiBriefcase,     label: 'Maleta'     },
  GiWool:          { component: GiWool,          label: 'Tricô/Lã'   },
  MdOutlineCheckroom: { component: MdOutlineCheckroom, label: 'Guarda-roupa' },
  FaChild:         { component: FaChild,         label: 'Infantil'   },
  BsShop:          { component: BsShop,          label: 'Loja'       },
  MdOutlineSpa:    { component: MdOutlineSpa,    label: 'Bem-estar'  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://geral-revestese-api.r954jc.easypanel.host';
const FILE_SERVER = 'https://n8n-doodledreamsmidia.r954jc.easypanel.host';

function isImageUrl(name) {
  return name && (name.startsWith('/') || name.startsWith('http'));
}

function IconPreview({ name, size = 20 }) {
  if (isImageUrl(name)) {
    const src = name.startsWith('http') ? name : `${FILE_SERVER}${name}`;
    return (
      <img
        src={src}
        alt="ícone"
        width={size}
        height={size}
        style={{ objectFit: 'contain', borderRadius: 4 }}
      />
    );
  }
  const entry = ICON_MAP[name];
  if (!entry) return <GiHanger size={size} />;
  const Icon = entry.component;
  return <Icon size={size} />;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState({ nome: '', descricao: '', icone: 'GiHanger', ativo: true });
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState('');
  const [iconTab,    setIconTab]    = useState('grid'); // 'grid' | 'custom'
  const [iconUploadPct,  setIconUploadPct]  = useState(0);
  const [iconUploading,  setIconUploading]  = useState(false);
  const [iconUploadErr,  setIconUploadErr]  = useState('');
  const iconInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/categorias'); setCategorias(r.data || []); }
    catch { setCategorias([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => {
    setForm({ nome: '', descricao: '', icone: 'GiHanger', ativo: true });
    setEditing(null); setModal(true); setIconTab('grid');
  };
  const openEdit = (c) => {
    setForm({ nome: c.nome || '', descricao: c.descricao || '', icone: c.icone || 'GiHanger', ativo: c.ativo ?? true });
    setEditing(c.id); setModal(true); setIconTab('grid');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categorias/${editing}`, form);
        showToast('Categoria atualizada!');
      } else {
        await api.post('/categorias', form);
        showToast('Categoria criada!');
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconUploadErr('');
    setIconUploading(true);
    setIconUploadPct(0);

    const formData = new FormData();
    formData.append('icone', file);

    const token = localStorage.getItem('reveste_token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/categorias/icone/upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setIconUploadPct(Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      setIconUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          setForm(p => ({ ...p, icone: data.url }));
        } else {
          setIconUploadErr(data.erro || 'Erro ao enviar imagem.');
        }
      } catch { setIconUploadErr('Erro ao processar resposta.'); }
    };
    xhr.onerror = () => { setIconUploading(false); setIconUploadErr('Falha na conexão.'); };
    xhr.send(formData);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categorias/${id}`);
      showToast('Categoria removida.');
      setConfirm(null);
      load();
    } catch { showToast('Erro ao remover. Verifique se há produtos nessa categoria.'); setConfirm(null); }
  };

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Categorias</h1>
          <p className={styles.pageSub}>{categorias.length} categorias cadastradas</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><BsPlus size={18}/> Nova categoria</button>
      </div>

      <div className={styles.card}>
        {loading ? <p className={styles.loadingText}>Carregando...</p> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Ícone</th><th>#</th><th>Nome</th><th>Descrição</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className={catStyles.iconCell}>
                        <IconPreview name={c.icone} size={22} />
                      </div>
                    </td>
                    <td className={styles.tdMono}>#{c.id}</td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{c.nome}</td>
                    <td className={styles.tdMuted}>{c.descricao || '—'}</td>
                    <td>
                      <span className={styles.badge} style={c.ativo ? { background: '#d1fae5', color: '#059669' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                        {c.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.btnIcon} onClick={() => openEdit(c)} title="Editar"><BsPencil/></button>
                        <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => setConfirm(c.id)} title="Excluir"><BsTrash/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr><td colSpan={6} className={styles.empty}>Nenhuma categoria encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal criar / editar ── */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(false)}>
          <div className={`${styles.modal} ${catStyles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(false)}><BsX size={20}/></button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>

                {/* Nome */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Vestidos"/>
                </div>

                {/* Descrição */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <textarea rows={2} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Breve descrição da categoria..."/>
                </div>

                {/* ── Seletor de ícone ── */}
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Ícone da categoria</label>

                  {/* Preview do selecionado */}
                  <div className={catStyles.iconPreviewBar}>
                    <div className={catStyles.iconPreviewBox}>
                      <IconPreview name={form.icone} size={30} />
                    </div>
                    <span className={catStyles.iconPreviewName}>
                      {ICON_MAP[form.icone]?.label || form.icone}
                    </span>
                  </div>

                  {/* Abas */}
                  <div className={catStyles.iconTabs}>
                    <button type="button" className={`${catStyles.iconTab} ${iconTab === 'grid' ? catStyles.iconTabActive : ''}`} onClick={() => setIconTab('grid')}>
                      Escolher da lista
                    </button>
                    <button type="button" className={`${catStyles.iconTab} ${iconTab === 'custom' ? catStyles.iconTabActive : ''}`} onClick={() => setIconTab('custom')}>
                      Nome personalizado
                    </button>
                  </div>

                  {/* Grade de ícones */}
                  {iconTab === 'grid' && (
                    <div className={catStyles.iconGrid}>
                      {Object.entries(ICON_MAP).map(([key, { component: Icon, label }]) => (
                        <button
                          key={key}
                          type="button"
                          title={label}
                          onClick={() => setForm(p => ({ ...p, icone: key }))}
                          className={`${catStyles.iconOption} ${form.icone === key ? catStyles.iconOptionSelected : ''}`}
                        >
                          <Icon size={22} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Upload de imagem personalizada */}
                  {iconTab === 'custom' && (
                    <div className={catStyles.iconUpload}>
                      <label className={catStyles.iconUploadLabel}>
                        <input
                          type="file"
                          accept="image/*"
                          ref={iconInputRef}
                          onChange={handleIconUpload}
                          disabled={iconUploading}
                        />
                        {iconUploading ? (
                          <>
                            <BsCloudUpload />
                            <span>Enviando… {iconUploadPct}%</span>
                            <div className={catStyles.iconUploadProgress}>
                              <div className={catStyles.iconUploadProgressBar} style={{ width: `${iconUploadPct}%` }} />
                            </div>
                          </>
                        ) : isImageUrl(form.icone) ? (
                          <>
                            <img
                              src={form.icone.startsWith('http') ? form.icone : `${FILE_SERVER}${form.icone}`}
                              alt="preview"
                              className={catStyles.iconUploadPreview}
                            />
                            <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Clique para trocar</span>
                          </>
                        ) : (
                          <>
                            <BsCloudUpload />
                            <span>Clique para selecionar imagem</span>
                          </>
                        )}
                      </label>
                      {iconUploadErr && <p className={catStyles.iconUploadError}>{iconUploadErr}</p>}
                      <p className={catStyles.iconUploadHint}>PNG, JPG ou WebP · máx. 5 MB</p>
                    </div>
                  )}
                </div>

                {/* Ativo */}
                <div className={styles.field}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.ativo} onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))}/>
                    Categoria ativa
                  </label>
                </div>

              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Salvando...' : <><BsCheckLg/> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Excluir esta categoria? Produtos vinculados podem ser afetados.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.btnSecondary} onClick={() => setConfirm(null)}>Cancelar</button>
              <button className={styles.btnDangerFill} onClick={() => handleDelete(confirm)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
