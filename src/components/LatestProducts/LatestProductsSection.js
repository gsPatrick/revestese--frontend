'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Image from 'next/image';
import styles from './LatestProductsSection.module.css';
// USANDO O CARD DE LAYOUT VERTICAL
import ProductCard from '@/components/ProductCard/ProductCard';
import api from '@/services/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LatestProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await api.get('/produtos/lancamentos?limit=5');
        const formattedProducts = response.data.map(p => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.nome,
          price: p.variacoes && p.variacoes.length > 0 ? Number(p.variacoes[0].preco) : 0.00,
          imageSrc: p.imagens && p.imagens.length > 0 ? p.imagens[0] : 'https://placehold.co/400x500.png',
          isNew: true,
          buttonColor: Math.random() > 0.5 ? 'purple' : 'blue',
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error("Erro ao buscar lançamentos:", err);
        setError("Não foi possível carregar os lançamentos no momento.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  useEffect(() => {
    // ... (Animações GSAP permanecem iguais)
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.productsGridWrapper}>
          <div className={styles.productsGrid}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.cardPlaceholder} />
            ))}
          </div>
        </div>
      );
    }
    if (error) {
      return <p className={styles.errorText}>{error}</p>;
    }
    if (products.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <h3 className={styles.emptyMessage}>
            Novas <span className={styles.highlight}>peças únicas</span> chegam toda semana.
          </h3>
          <p className={styles.emptySubMessage}>
            Em breve o acervo será atualizado com novas chegadas!
          </p>
        </div>
      );
    }
    return (
      <div className={styles.productsGridWrapper}>
        <div className={styles.productsGrid}>
          {products.map((product, index) => (
             // Envolvemos o card em uma div para a ref da animação GSAP
             <div key={product.id} ref={el => { if(el) cardsRef.current[index] = el; }}>
                <ProductCard product={product} />
             </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className={styles.latestProductsSection}>
      <div className={styles.decorativeElementsContainer}>
        {/* ...elementos... */}
      </div>
      <h2 ref={titleRef} className={styles.sectionTitle}>Recém Chegadas</h2>
      <p ref={subtitleRef} className={styles.sectionSubtitle}>Peças únicas que acabaram de entrar no acervo</p>
      {renderContent()}
    </section>
  );
};

export default LatestProductsSection;