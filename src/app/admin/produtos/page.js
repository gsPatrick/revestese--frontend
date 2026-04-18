'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import { BsPlus, BsPencil, BsTrash, BsSearch, BsX, BsCheckLg } from 'react-icons/bs';
import Image from 'next/image';

const EMPTY = { nome: '', descricao: '', preco: '', estoque: '', categoria_id: '', condicao: 'bom', ativo: true };
const CONDICAO = ['novo', 'como_novo', 'bom', 'regular'];

export default function ProdutosPage() {
  const [produtos,    setProdutos]    = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [editing,     setEditing]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState('');
  const [confirm,     setConfirm]     = useState(null); // id to delete

  const LIMIT = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.busca = search;
      const res = await api.get('/produtos', { params });
      const data = res.data;
      setProdutos(data.produtos || data || []);
      setTotal(data.total ?? (data.produtos ?? data).length);
    } catch { setProdutos([]); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/categorias').then(r => setCategorias(r.data || [])); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit   = (p) => {
    setForm({
      nome: p.nome || '', descricao: p.descricao || '',
      preco: p.preco || '', estoque: p.estoque ?? '',
      categoria_id: p.categoria_id || p.categoriaId || '',
      condicao: p.condicao || 'bom', ativo: p.ativo ?? true,
    });
    setEditing(p.id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, preco: parseFloat(form.preco), estoque: parseInt(form.estoque) };
      if (editing) {
        await api.put(`/produtos/${editing}`, payload);
        showToast('Produto atualizado!');
      } else {
        await api.post('/produtos', payload);
        showToast('Produto criado!');
      }
      setModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar produto.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/produtos/${id}`);
      showToast('Produto removido.');
      setConfirm(null);
      load();
    } catch { showToast('Erro ao remover produto.'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Produtos</h1>
          <p className={styles.pageSub}>{total} peças no acervo</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}><BsPlus size={18}/> Novo produto</button>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <BsSearch className={styles.searchIcon}/>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar produto..."
          className={styles.searchInput}
        />
        {search && <button className={styles.searchClear} onClick={() => setSearch('')}><BsX/></button>}
      </div>

      {/* Grid */}
      {loading ? <p className={styles.loadingText}>Carregando...</p> : (
        <div className={styles.productGrid}>
          {produtos.map(p => (
            <div key={p.id} className={styles.productCard}>
              <div className={styles.productImg}>
                {p.imagens?.[0] ? (
                  <Image src={p.imagens[0]} alt={p.nome} fill style={{ objectFit: 'cover' }} unoptimized/>
                ) : (
                  <div className={styles.productImgPlaceholder}>📦</div>
                )}
                <span className={`${styles.statusDot} ${p.ativo ? styles.dotActive : styles.dotOff}`}/>
              </div>
              <div className={styles.productInfo}>
                <p className={styles.productName}>{p.nome}</p>
                <p className={styles.productPrice}>
                  {p.preco ? `R$ ${Number(p.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                </p>
                <p className={styles.productMeta}>{p.condicao} · estoque: {p.estoque ?? '—'}</p>
              </div>
              <div className={styles.productActions}>
                <button className={styles.btnIcon} onClick={() => openEdit(p)} title="Editar"><BsPencil/></button>
                <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => setConfirm(p.id)} title="Excluir"><BsTrash/></button>
              </div>
            </div>
          ))}
          {produtos.length === 0 && <p className={styles.empty}>Nenhum produto encontrado.</p>}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Ant.</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Próx. →</button>
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar produto' : 'Novo produto'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(false)}><BsX size={20}/></button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome *</label>
                  <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Blazer tweed vintage"/>
                </div>
                <div className={styles.field}>
                  <label>Preço (R$) *</label>
                  <input required type="number" step="0.01" min="0" value={form.preco} onChange={e => setForm(p => ({ ...p, preco: e.target.value }))} placeholder="89.90"/>
                </div>
                <div className={styles.field}>
                  <label>Estoque</label>
                  <input type="number" min="0" value={form.estoque} onChange={e => setForm(p => ({ ...p, estoque: e.target.value }))} placeholder="1"/>
                </div>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}>
                    <option value="">Sem categoria</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Condição</label>
                  <select value={form.condicao} onChange={e => setForm(p => ({ ...p, condicao: e.target.value }))}>
                    {CONDICAO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <textarea rows={3} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Descreva a peça..."/>
                </div>
                <div className={styles.field}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.ativo} onChange={e => setForm(p => ({ ...p, ativo: e.target.checked }))}/>
                    Produto ativo
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

      {/* Confirm delete */}
      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Tem certeza que deseja excluir este produto?</p>
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
