'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/services/api';
import styles from '../shared.module.css';
import pStyles from './produtos.module.css';
import { BsPlus, BsPencil, BsTrash, BsSearch, BsX, BsCheckLg, BsDash, BsCloudUpload, BsImage } from 'react-icons/bs';
import Image from 'next/image';

const EMPTY_PRODUTO = {
  nome: '', descricao: '', categoria_id: '', ativo: true,
  peso: '0.300', largura: '20', altura: '5', comprimento: '30',
};
const EMPTY_VAR = { nome: 'Único', preco: '', estoque: '1', ativo: true, digital: false };

// Steps: 0 = dados, 1 = imagens, 2 = variações
const STEPS = ['Dados', 'Imagens', 'Variações'];

export default function ProdutosPage() {
  const [produtos,   setProdutos]   = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);

  // Modal state
  const [modal,      setModal]      = useState(false);
  const [step,       setStep]       = useState(0);
  const [form,       setForm]       = useState(EMPTY_PRODUTO);
  const [savedId,    setSavedId]    = useState(null); // produto ID after step 0
  const [variacoes,  setVariacoes]  = useState([{ ...EMPTY_VAR }]);
  const [editVars,   setEditVars]   = useState([]);
  const [editing,    setEditing]    = useState(null);

  // Images
  const [imageFiles,   setImageFiles]   = useState([]);
  const [imagePreviews,setImagePreviews]= useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const fileRef = useRef();

  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [confirm, setConfirm] = useState(null);

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

  const resetModal = () => {
    setForm(EMPTY_PRODUTO);
    setVariacoes([{ ...EMPTY_VAR }]);
    setEditVars([]);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImgs([]);
    setSavedId(null);
    setEditing(null);
    setStep(0);
  };

  const openCreate = () => { resetModal(); setModal(true); };

  const openEdit = async (p) => {
    resetModal();
    setForm({
      nome: p.nome || '', descricao: p.descricao || '',
      categoria_id: p.categoriaId || p.categoria_id || '',
      ativo: p.ativo ?? true,
      peso: p.peso ?? '0.300', largura: p.largura ?? '20',
      altura: p.altura ?? '5', comprimento: p.comprimento ?? '30',
    });
    setEditing(p.id);
    setSavedId(p.id);
    // Load existing images
    setExistingImgs(p.imagens || p.ArquivoProdutos?.filter(a => a.tipo === 'imagem') || []);
    // Load existing variations
    try {
      const r = await api.get(`/produtos/${p.id}/variacoes`);
      setEditVars(r.data || []);
    } catch { setEditVars([]); }
    setModal(true);
  };

  const closeModal = () => { setModal(false); resetModal(); };

  // ── Step 0: Save product data ──
  const handleSaveDados = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: form.nome, descricao: form.descricao,
        categoriaId: form.categoria_id || null,
        ativo: form.ativo,
        peso: parseFloat(form.peso) || 0.3,
        largura: parseFloat(form.largura) || 20,
        altura: parseFloat(form.altura) || 5,
        comprimento: parseFloat(form.comprimento) || 30,
      };

      if (editing) {
        await api.put(`/produtos/${editing}`, payload);
        setSavedId(editing);
      } else {
        const res = await api.post('/produtos', payload);
        setSavedId(res.data.id);
      }
      setStep(1);
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar dados do produto.');
    } finally { setSaving(false); }
  };

  // ── Step 1: Upload images ──
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingImage = async (img) => {
    const id = img.id || img;
    if (id && typeof id === 'number') {
      try { await api.delete(`/arquivos/${id}`); } catch {}
    }
    setExistingImgs(prev => prev.filter(im => (im.id || im) !== (img.id || img)));
  };

  const handleUploadImages = async () => {
    if (imageFiles.length === 0) { setStep(2); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      imageFiles.forEach(f => formData.append('imagens', f));
      await api.post(`/uploads/produtos/${savedId}/imagens`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(`${imageFiles.length} imagem(ns) enviada(s)!`);
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro no upload das imagens.');
    } finally { setSaving(false); }
  };

  // ── Step 2: Save variations ──
  const updateVar = (i, field, val) =>
    setVariacoes(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
  const addVar    = () => setVariacoes(prev => [...prev, { ...EMPTY_VAR }]);
  const removeVar = (i) => setVariacoes(prev => prev.filter((_, idx) => idx !== i));

  const handleDeleteVar = async (varId) => {
    try {
      await api.delete(`/produtos/${savedId}/variacoes/${varId}`);
      setEditVars(prev => prev.filter(v => v.id !== varId));
      showToast('Variação removida.');
    } catch { showToast('Erro ao remover variação.'); }
  };

  const handleSaveVariacoes = async () => {
    setSaving(true);
    try {
      const varsValidas = variacoes.filter(v => v.preco && parseFloat(v.preco) > 0);
      for (const v of varsValidas) {
        await api.post(`/produtos/${savedId}/variacoes`, {
          nome: v.nome || 'Único',
          preco: parseFloat(v.preco),
          estoque: v.digital ? 0 : (parseInt(v.estoque) || 0),
          ativo: v.ativo,
          digital: v.digital,
        });
      }
      showToast('Produto salvo com sucesso!');
      closeModal();
      load();
    } catch (err) {
      showToast(err.response?.data?.erro || 'Erro ao salvar variações.');
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
                {(p.imagens?.[0] || p.ArquivoProdutos?.[0]?.url) ? (
                  <Image src={p.imagens?.[0] || p.ArquivoProdutos?.[0]?.url} alt={p.nome} fill style={{ objectFit: 'cover' }} unoptimized/>
                ) : (
                  <div className={styles.productImgPlaceholder}><BsImage size={28} color="#d1d5db"/></div>
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
                <p className={styles.productMeta}>{p.variacoes?.length ?? 0} variação(ões)</p>
              </div>
              <div className={styles.productActions}>
                <button className={styles.btnIcon} onClick={() => openEdit(p)}><BsPencil/></button>
                <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => setConfirm(p.id)}><BsTrash/></button>
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

      {/* ══ MODAL ══ */}
      {modal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={pStyles.modal} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar produto' : 'Novo produto'}</h2>
              <button className={styles.modalClose} onClick={closeModal}><BsX size={18}/></button>
            </div>

            {/* Steps indicator */}
            <div className={pStyles.steps}>
              {STEPS.map((s, i) => (
                <div key={i} className={`${pStyles.step} ${i === step ? pStyles.stepActive : ''} ${i < step ? pStyles.stepDone : ''}`}>
                  <div className={pStyles.stepDot}>{i < step ? '✓' : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* ── Step 0: Dados ── */}
            {step === 0 && (
              <form onSubmit={handleSaveDados} className={pStyles.body}>
                <p className={styles.sectionLabel}>Informações gerais</p>
                <div className={styles.formGrid}>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Nome *</label>
                    <input required value={form.nome} onChange={e => f('nome', e.target.value)} placeholder="Ex: Blazer tweed vintage P/M"/>
                  </div>
                  <div className={styles.field}>
                    <label>Categoria</label>
                    <select value={form.categoria_id} onChange={e => f('categoria_id', e.target.value)}>
                      <option value="">Sem categoria</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.checkLabel} style={{ height: '100%', alignItems: 'center' }}>
                      <input type="checkbox" checked={form.ativo} onChange={e => f('ativo', e.target.checked)}/>
                      Produto ativo (visível na loja)
                    </label>
                  </div>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Descrição</label>
                    <textarea rows={4} value={form.descricao} onChange={e => f('descricao', e.target.value)} placeholder="Descreva a peça: estado de conservação, tecido, medidas, observações..."/>
                  </div>
                </div>

                <p className={styles.sectionLabel} style={{ marginTop: '1.25rem' }}>Dimensões para cálculo de frete</p>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Peso (kg)</label>
                    <input type="number" step="0.001" min="0" value={form.peso} onChange={e => f('peso', e.target.value)} placeholder="0.300"/>
                  </div>
                  <div className={styles.field}>
                    <label>Largura (cm)</label>
                    <input type="number" step="0.1" min="0" value={form.largura} onChange={e => f('largura', e.target.value)} placeholder="20"/>
                  </div>
                  <div className={styles.field}>
                    <label>Altura (cm)</label>
                    <input type="number" step="0.1" min="0" value={form.altura} onChange={e => f('altura', e.target.value)} placeholder="5"/>
                  </div>
                  <div className={styles.field}>
                    <label>Comprimento (cm)</label>
                    <input type="number" step="0.1" min="0" value={form.comprimento} onChange={e => f('comprimento', e.target.value)} placeholder="30"/>
                  </div>
                </div>

                <div className={pStyles.footer}>
                  <button type="button" className={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                  <button type="submit" className={styles.btnPrimary} disabled={saving}>
                    {saving ? 'Salvando...' : 'Próximo: Imagens →'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 1: Imagens ── */}
            {step === 1 && (
              <div className={pStyles.body}>
                <p className={styles.sectionLabel}>Fotos do produto</p>

                {/* Existing images */}
                {existingImgs.length > 0 && (
                  <div className={pStyles.imgGrid}>
                    {existingImgs.map((img, i) => {
                      const url = typeof img === 'string' ? img : img.url;
                      return (
                        <div key={i} className={pStyles.imgThumb}>
                          <Image src={url} alt={`img ${i}`} fill style={{ objectFit: 'cover' }} unoptimized/>
                          <button type="button" className={pStyles.imgRemove} onClick={() => removeExistingImage(img)}>
                            <BsX size={14}/>
                          </button>
                          {i === 0 && <span className={pStyles.imgPrincipal}>Principal</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <div className={pStyles.imgGrid} style={{ marginTop: existingImgs.length > 0 ? '0.75rem' : 0 }}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} className={`${pStyles.imgThumb} ${pStyles.imgThumbNew}`}>
                        <Image src={src} alt={`novo ${i}`} fill style={{ objectFit: 'cover' }} unoptimized/>
                        <button type="button" className={pStyles.imgRemove} onClick={() => removeNewImage(i)}>
                          <BsX size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                <div className={pStyles.uploadArea} onClick={() => fileRef.current?.click()}>
                  <BsCloudUpload size={32} className={pStyles.uploadIcon}/>
                  <p className={pStyles.uploadText}>Clique para selecionar imagens</p>
                  <p className={pStyles.uploadSub}>JPG, PNG, WebP — múltiplas permitidas</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange}/>
                </div>

                <div className={pStyles.footer}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setStep(0)}>← Voltar</button>
                  <button type="button" className={styles.btnPrimary} disabled={saving} onClick={handleUploadImages}>
                    {saving ? 'Enviando...' : imageFiles.length > 0 ? `Enviar ${imageFiles.length} imagem(ns) →` : 'Pular →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Variações ── */}
            {step === 2 && (
              <div className={pStyles.body}>
                {/* Existing variations */}
                {editVars.length > 0 && (
                  <>
                    <p className={styles.sectionLabel}>Variações existentes</p>
                    <div className={styles.varList}>
                      {editVars.map(v => (
                        <div key={v.id} className={styles.varRow}>
                          <span className={styles.varName}>{v.nome}</span>
                          <span className={styles.varPrice}>R$ {Number(v.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          {v.digital
                            ? <span className={styles.badge} style={{ background: '#eff6ff', color: '#2563eb' }}>💾 Digital</span>
                            : <span className={styles.varStock}>Est: {v.estoque}</span>
                          }
                          <span className={styles.badge} style={v.ativo ? { background: '#d1fae5', color: '#059669' } : { background: '#f3f4f6', color: '#9ca3af' }}>
                            {v.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                          <button type="button" className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => handleDeleteVar(v.id)}><BsTrash size={13}/></button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <p className={styles.sectionLabel} style={{ margin: 0 }}>
                    {editVars.length > 0 ? 'Adicionar nova variação' : 'Variações (preço e estoque)'}
                  </p>
                  <button type="button" className={styles.btnSecondary} style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }} onClick={addVar}>
                    <BsPlus/> Adicionar
                  </button>
                </div>

                {variacoes.map((v, i) => (
                  <div key={i} className={styles.varCard}>
                    <div className={styles.varCardTop}>
                      <span className={styles.varCardIndex}>{i + 1}</span>
                      <div className={styles.field} style={{ flex: 1 }}>
                        <label>Nome da variação</label>
                        <input value={v.nome} onChange={e => updateVar(i, 'nome', e.target.value)} placeholder="Ex: Único, P, M, G, 38..."/>
                      </div>
                      {variacoes.length > 1 && (
                        <button type="button" className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={() => removeVar(i)}><BsDash/></button>
                      )}
                    </div>

                    <div className={styles.varTypeToggle}>
                      <button type="button" className={`${styles.varTypeBtn} ${!v.digital ? styles.varTypeBtnActive : ''}`} onClick={() => updateVar(i, 'digital', false)}>
                        🏷 Físico
                      </button>
                      <button type="button" className={`${styles.varTypeBtn} ${v.digital ? styles.varTypeBtnActiveDigital : ''}`} onClick={() => updateVar(i, 'digital', true)}>
                        💾 Digital
                      </button>
                    </div>

                    <div className={styles.varCardFields}>
                      <div className={styles.field}>
                        <label>Preço (R$) *</label>
                        <input type="number" step="0.01" min="0" value={v.preco} onChange={e => updateVar(i, 'preco', e.target.value)} placeholder="89.90"/>
                      </div>
                      <div className={styles.field}>
                        <label>Estoque {v.digital && <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.65rem' }}>(N/A)</span>}</label>
                        <input type="number" min="0" value={v.estoque} onChange={e => updateVar(i, 'estoque', e.target.value)} placeholder="1" disabled={v.digital}/>
                      </div>
                    </div>
                  </div>
                ))}

                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0.5rem 0 0' }}>
                  Variações com preço em branco serão ignoradas.
                </p>

                <div className={pStyles.footer}>
                  <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>← Voltar</button>
                  <button type="button" className={styles.btnPrimary} disabled={saving} onClick={handleSaveVariacoes}>
                    {saving ? 'Salvando...' : <><BsCheckLg/> Concluir</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirm && (
        <div className={styles.modalOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <p>Excluir este produto e todas as suas imagens e variações?</p>
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
