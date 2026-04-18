'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheckLg } from 'react-icons/bs';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState({ nome: '', descricao: '' });
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/categorias'); setCategorias(r.data || []); }
    catch { setCategorias([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setForm({ nome: '', descricao: '' }); setEditing(null); setModal(true); };
  const openEdit   = (c) => { setForm({ nome: c.nome || '', descricao: c.descricao || '' }); setEditing(c.id); setModal(true); };

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
                <tr><th>#</th><th>Nome</th><th>Descrição</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {categorias.map(c => (
                  <tr key={c.id}>
                    <td className={styles.tdMono}>#{c.id}</td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{c.nome}</td>
                    <td className={styles.tdMuted}>{c.descricao || '—'}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.btnIcon} onClick={() => openEdit(c)} title="Editar"><BsPencil/></button>
                        <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => setConfirm(c.id)} title="Excluir"><BsTrash/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr><td colSpan={4} className={styles.empty}>Nenhuma categoria encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(false)}><BsX size={20}/></button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Vestidos"/>
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <textarea rows={2} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Breve descrição da categoria..."/>
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
