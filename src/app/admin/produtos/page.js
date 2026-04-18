'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import { BsPlus, BsPencil, BsTrash, BsSearch, BsX, BsCheckLg, BsDash } from 'react-icons/bs';
import Image from 'next/image';

const EMPTY_PRODUTO = {
  nome: '', descricao: '', categoria_id: '', ativo: true,
  peso: '0.300', largura: '10', altura: '10', comprimento: '10',
};

const EMPTY_VARIACAO = { nome: 'Único', preco: '', estoque: '1', ativo: true };

export default function ProdutosPage() {
  const [produtos,   setProdutos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY_PRODUTO);
  const [variacoes,  setVariacoes]  = useState([{ ...EMPTY_VARIACAO }]);
  const [editing,    setEditing]    = useState(null);
  const [editVars,   setEditVars]   = useState([]);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState('');
  const [confirm,    setConfirm]    = useState(null);

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

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const openCreate = () => {
    setForm(EMPTY_PRODUTO);
    setVariacoes([{ ...EMPTY_VARIACAO }]);
    setEditing(null);
    setEditVars([]);
    setModal(true);
  };

  const openEdit = async (p) => {
    setForm({
      nome: p.nome || '', descricao: p.descricao || '',
      categoria_id: p.categoriaId || p.categoria_id || '',
      ativo: p.ativo ?? true,
      peso: p.peso ?? '0.300', largura: p.largura ?? '10',
      altura: p.altura ?? '10', comprimento: p.comprimento ?? '10',
    });
    setEditing(p.id);
    setVariacoes([{ ...EMPTY_VARIACAO }]);
    // Buscar variações existentes
    try {
      const r = await api.get(`/produtos/${p.id}/variacoes`);
      setEditVars(r.data || []);
    } catch { setEditVars([]); }
    setModal(true);
  };

  // Variações helpers
  const updateVar = (i, field, val) =>
    setVariacoes(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  const addVar = () => setVariacoes(prev => [...prev, { ...EMPTY_VARIACAO }]);
  const removeVar = (i) => setVariacoes(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        categoriaId: form.categoria_id || null,
        peso: parseFloat(form.peso) || 0.3,
        largura: parseFloat(form.largura) || 10,
        altura: parseFloat(form.altura) || 10,
        comprimento: parseFloat(form.comprimento) || 10,
      };
      delete payload.categoria_id;

      let produtoId = editing;

      if (editing) {
        await api.put(`/produtos/${editing}`, payload);
        showToast('Produto atualizado!');
      } else {
        const res = await api.post('/produtos', payload);
        produtoId = res.data.id;
        showToast('Produto criado!');
      }

      // Criar variações novas (apenas as que têm preço preenchido)
      const varsValidas = variacoes.filter(v => v.preco && parseFloat(v.preco) > 0);
      for (const v of varsValidas) {
        await api.post(`/produtos/${produtoId}/variacoes`, {
          nome: v.nome || 'Único',
          preco: parseFloat(v.preco),
          estoque: parseInt(v.estoque) || 0,
          ativo: v.ativo,
        });
      }

      setModal(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar produto.');
    } finally { setSaving(false); }
  };

  const handleDeleteVar = async (produtoId, varId) => {
    try {
      await api.delete(`/produtos/${produtoId}/variacoes/${varId}`);
      setEditVars(prev => prev.filter(v => v.id !== varId));
      showToast('Variação removida.');
    } catch { showToast('Erro ao remover variação.'); }
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
  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

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

      <div className={styles.searchBar}>
        <BsSearch className={styles.searchIcon}/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar produto..." className={styles.searchInput}/>
        {search && <button className={styles.searchClear} onClick={() => setSearch('')}><BsX/></button>}
      </div>

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
                  {p.variacoes?.[0]?.preco
                    ? `R$ ${Number(p.variacoes[0].preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '—'}
                </p>
                <p className={styles.productMeta}>
                  {p.variacoes?.length ?? 0} variação(ões)
                </p>
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

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Ant.</button>
          <span className={styles.pageInfo}>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Próx. →</button>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar produto' : 'Novo produto'}</h2>
              <button className={styles.modalClose} onClick={() => setModal(false)}><BsX size={20}/></button>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
              {/* ── Dados do produto ── */}
              <p className={styles.sectionLabel}>Dados do produto</p>
              <div className={styles.formGrid}>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Nome *</label>
                  <input required value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Ex: Blazer tweed vintage"/>
                </div>
                <div className={styles.field}>
                  <label>Categoria</label>
                  <select value={form.categoria_id} onChange={e => f('categoria_id', e.target.value)}>
                    <option value="">Sem categoria</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.checkLabel} style={{ marginTop: '1.6rem' }}>
                    <input type="checkbox" checked={form.ativo} onChange={e => f('ativo', e.target.checked)}/>
                    Produto ativo
                  </label>
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Descrição</label>
                  <textarea rows={3} value={form.descricao} onChange={e => f('descricao', e.target.value)} placeholder="Descreva a peça, estado de conservação, tecido, etc."/>
                </div>
              </div>

              {/* ── Dimensões (para cálculo de frete) ── */}
              <p className={styles.sectionLabel} style={{ marginTop: '1.25rem' }}>Dimensões para frete</p>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Peso (kg)</label>
                  <input type="number" step="0.001" min="0" value={form.peso} onChange={e => f('peso', e.target.value)} placeholder="0.300"/>
                </div>
                <div className={styles.field}>
                  <label>Largura (cm)</label>
                  <input type="number" step="0.01" min="0" value={form.largura} onChange={e => f('largura', e.target.value)} placeholder="10"/>
                </div>
                <div className={styles.field}>
                  <label>Altura (cm)</label>
                  <input type="number" step="0.01" min="0" value={form.altura} onChange={e => f('altura', e.target.value)} placeholder="10"/>
                </div>
                <div className={styles.field}>
                  <label>Comprimento (cm)</label>
                  <input type="number" step="0.01" min="0" value={form.comprimento} onChange={e => f('comprimento', e.target.value)} placeholder="10"/>
                </div>
              </div>

              {/* ── Variações existentes (modo edição) ── */}
              {editing && editVars.length > 0 && (
                <>
                  <p className={styles.sectionLabel} style={{ marginTop: '1.25rem' }}>Variações existentes</p>
                  <div className={styles.varList}>
                    {editVars.map(v => (
                      <div key={v.id} className={styles.varRow}>
                        <span className={styles.varName}>{v.nome}</span>
                        <span className={styles.varPrice}>R$ {Number(v.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className={styles.varStock}>Estoque: {v.estoque}</span>
                        <span className={`${styles.badge} ${v.ativo ? '' : styles.badgeOff}`} style={v.ativo ? { background: '#d1fae5', color: '#059669' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                          {v.ativo ? 'Ativa' : 'Inativa'}
                        </span>
                        <button type="button" className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => handleDeleteVar(editing, v.id)} title="Remover"><BsTrash/></button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Novas variações ── */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <p className={styles.sectionLabel} style={{ margin: 0 }}>
                  {editing ? 'Adicionar variação' : 'Variações (preço / estoque)'}
                </p>
                <button type="button" className={styles.btnSecondary} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={addVar}>
                  <BsPlus/> Adicionar
                </button>
              </div>

              {variacoes.map((v, i) => (
                <div key={i} className={styles.varInputRow}>
                  <div className={styles.field} style={{ flex: 2 }}>
                    {i === 0 && <label>Nome</label>}
                    <input value={v.nome} onChange={e => updateVar(i, 'nome', e.target.value)} placeholder="Ex: Único, P, M, G"/>
                  </div>
                  <div className={styles.field} style={{ flex: 1.5 }}>
                    {i === 0 && <label>Preço (R$) *</label>}
                    <input type="number" step="0.01" min="0" value={v.preco} onChange={e => updateVar(i, 'preco', e.target.value)} placeholder="89.90"/>
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    {i === 0 && <label>Estoque</label>}
                    <input type="number" min="0" value={v.estoque} onChange={e => updateVar(i, 'estoque', e.target.value)} placeholder="1"/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                    {variacoes.length > 1 && (
                      <button type="button" className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => removeVar(i)}><BsDash/></button>
                    )}
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>
                Preço e estoque ficam nas variações. Deixe o nome como "Único" se não houver tamanhos.
              </p>

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
            <p>Excluir este produto e todas as suas variações?</p>
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
