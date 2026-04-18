'use client';

import React, { useState, useEffect } from 'react';
import { trackPageview } from '@/services/analytics';
import { useFilter } from '@/context/FilterContext';
import FilterSidebar from '@/components/CatalogPage/FilterSidebar';
import ProductGrid from '@/components/CatalogPage/ProductGrid';
import api from '@/services/api';
import styles from './CatalogPage.module.css';
import { BsFilterRight, BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { motion } from 'framer-motion';

export default function CatalogPage() {
  const [products, setProducts]     = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { filters, setFilters } = useFilter();

  useEffect(() => {
    document.body.classList.add('catalog-background');
    trackPageview('catalogo');
    return () => document.body.classList.remove('catalog-background');
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = {
          categorias: filters.categories.join(','),
          ordenarPor: filters.sort,
          limit: filters.limit,
          page: filters.page,
        };
        if (!params.categorias) delete params.categorias;

        const response = await api.get('/produtos', { params });
        const { produtos: apiProdutos, total, totalPages, currentPage } = response.data;

        const formattedProducts = apiProdutos.map(p => ({
          id:       p.id,
          slug:     p.slug || p.id,
          name:     p.nome,
          condicao: p.condicao,
          price:    p.variacoes?.length > 0 ? Number(p.variacoes[0].preco) : null,
          imageSrc: p.imagens?.length > 0 ? p.imagens[0] : null,
          isNew:    false,
        }));

        setProducts(formattedProducts);
        setPagination({ total, totalPages, currentPage });
      } catch {
        setError('Não foi possível carregar o acervo agora. Tente novamente em instantes.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.main}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className={styles.eyebrow}>Acervo completo</p>
            <h1 className={styles.pageTitle}>Todas as peças</h1>
            <p className={styles.pageSubtitle}>
              Cada item foi verificado, fotografado e selecionado pela nossa equipe.
              {!isLoading && pagination.total > 0 && (
                <span className={styles.totalCount}> {pagination.total} peças disponíveis.</span>
              )}
            </p>
          </motion.div>

          <button
            className={styles.mobileFilterButton}
            onClick={() => setIsFilterOpen(true)}
          >
            <BsFilterRight size={18} />
            Filtrar e ordenar
          </button>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className={styles.catalogLayout}>
        <aside className={styles.desktopSidebar}>
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </aside>

        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        <section className={styles.gridArea}>
          <ProductGrid products={products} isLoading={isLoading} error={error} />

          {/* Paginação */}
          {pagination.totalPages > 1 && !isLoading && !error && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                aria-label="Página anterior"
              >
                <BsChevronLeft />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === pagination.currentPage ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}

              <button
                className={styles.pageBtn}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                aria-label="Próxima página"
              >
                <BsChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
