'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import { BsPlus, BsPencil, BsTrash, BsX, BsCheckLg } from 'react-icons/bs';

const EMPTY = {
  codigo: '', desconto: '', tipo: 'percentual', usoMaximo: '',
  validade: '', ativo: true, descricao: '',
};

export default function CuponsPage() {
  const [cupons,  setCupons]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast,   setToast]   = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/cupons'); setCupons(r.data || []); }
    catch { setCupons([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit   = (c) => {
    setForm({
      codigo: c.codigo || '', desconto: c.desconto || '',
      tipo: c.tipo || 'percentual', usoMaximo: c.usoMaximo ?? '',
      validade: c.validade ? c.validade.split('T')[0] : '',
      ativo: c.ativo ?? true, descricao: c.descricao || '',
    });
    setEditing(c.id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        desconto: parseFloat(form.desconto),
        usoMaximo: form.usoMaximo ? parseInt(form.usoMaximo) : null,
        validade: form.validade || null,
      };
      if (editing) {
        await api.put(`/cupons/${editing}`, payload);
        showToast('Cupom atualizado!');
      } else {
        await api.post('/cupons', payload);
        showToast('Cupom criado!');
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar cupom.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cupons/${id}`);
      showToast('Cupom removido.');
      setConfirm(null);
      load();
    } catch { showToast('Erro ao remover cupom.'); setConfirm(null); }
  };

  const fmtDiscount = (c) => {
    if (!c.desconto) return '—';
    return c.tipo === 'percentual' ? `${c.desconto}%` : `R$ ${Number(c.desconto).toFixed(2)}`;
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Cupons</h1>
          <p className={styles.pageSub}>{cupons.length} cupons cadastrados</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><BsPlus size={18}/> Novo cupom</button>
      </div>

      <div className={styles.card}>
        {loading ? <p className={styles.loadingText}>Carregando...</p> : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>Código</th><th>Desconto</th><th>Tipo</th><th>Uso máx.</th><th>Validade</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {cupons.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#780e1a', background: '#fdf2f4', padding: '0.15rem 0.5rem', borderRadius: '3px', fontSize: '0.85rem' }}>
                        {c.codigo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{fmtDiscount(c)}</td>
                    <td className={styles.tdMuted}>{c.tipo === 'percentual' ? 'Percentual' : 'Fixo (R$)'}</td>
                    <td className={styles.tdMuted}>{c.usoMaximo ?? '∞'}</td>
                    <td className={styles.tdMuted}>{fmtDate(c.validade)}</td>
                    <td>
                      <span className={styles.badge} style={c.ativo ? { background: '#d1fae5', color: '#059669' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
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
                {cupons.length === 0 && (
                  <tr><td colSpan={7} className={styles.empty}>Nenhum cupom encontrado.</td></tr>
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
              <h2>{editing ? 'Editar cupom' : 'Novo cupom'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(false)}><BsX size={20}/></button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Código *</label>
                  <input required value={form.codigo} onChange={e => setForm(p => ({ ...p, codigo: e.target.value.toUpperCase() }))} placeholder="VERAO20"/>
                </div>
                <div className={styles.field}>
                  <label>Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor fixo (R$)</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Desconto * {form.tipo === 'percentual' ? '(%)' : '(R$)'}</label>
                  <input required type="number" step="0.01" min="0" value={form.desconto} onChange={e => setForm(p => ({ ...p, desconto: e.target.value }))} placeholder={form.tipo === 'percentual' ? '10' : '20.00'}/>
                </div>
                <div className={styles.field}>
                  <label>Uso máximo</label>
                  <input type="number" min="1" value={form.usoMaximo} onChange={e => setForm(p => ({ ...p, usoMaximo: e.target.value }))} placeholder="Ilimitado"/>
                </div>
                <div className={styles.field}>
                  <label>Validade</label>
                  <input type="date" value={form.validade} onChange={e => setForm(p => ({ ...p, validade: e.target.value }))}/>
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <input value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Uso interno (não exibido ao cliente)"/>
                </div>
                <div className={styles.field}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.ativo} onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))}/>
                    Cupom ativo
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

      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Excluir este cupom permanentemente?</p>
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
