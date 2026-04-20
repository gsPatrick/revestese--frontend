// src/app/[slug]/page.js

// Importações (sem alteração)
import styles from './ProductPage.module.css'; 
import Breadcrumb from '@/components/SubscriptionPage/Breadcrumb';
import ProductGallery from '@/components/ProductPage/ProductGallery';
import ProductDetails from '@/components/ProductPage/ProductDetails';
import ProductDescription from '@/components/ProductPage/ProductDescription';
import RelatedProducts from '@/components/ProductPage/RelatedProducts';
import api from '@/services/api';
import { notFound } from 'next/navigation';
import TrackView from '@/components/Analytics/TrackView';

async function getProductData(slug) {
  try {
    const productRes = await api.get(`/produtos/${slug}`);
    
    if (!productRes.data || Object.keys(productRes.data).length === 0) {
        notFound();
    }
    
    const apiProduct = productRes.data;

    let apiRelated = [];
    try {
        if (apiProduct.id) {
            const relatedRes = await api.get(`/produtos/${apiProduct.id}/relacionados`);
            apiRelated = relatedRes.data;
        }
    } catch (relatedError) {
        console.warn(`Aviso: Falha ao buscar produtos relacionados para ID ${apiProduct.id}.`);
    }

    const product = {
      id: apiProduct.id,
      name: apiProduct.nome || "Produto sem nome",
      description: apiProduct.descricao || "Descrição não disponível.",
      variations: (apiProduct.variacoes || []).map(v => ({
        id: v.id,
        name: v.nome || "Variação",
        price: Number(v.preco) || 0,
        stock: v.estoque || 0,
        digital: v.digital || false, // Adicionar a propriedade digital
      })),
      arquivoProdutos: apiProduct.ArquivoProdutos || [], 
      slug: apiProduct.slug,
      price: apiProduct.variacoes && apiProduct.variacoes.length > 0 ? Number(apiProduct.variacoes[0].preco) : 0.00,
      imageSrc: apiProduct.ArquivoProdutos?.find(a => a.tipo === 'imagem' && a.principal)?.url 
                || apiProduct.ArquivoProdutos?.find(a => a.tipo === 'imagem')?.url 
                || apiProduct.imagens?.[0] 
                || 'https://placehold.co/400x400.png',
      isNew: Math.random() > 0.5,
      buttonColor: Math.random() > 0.5 ? 'purple' : 'blue',
    };

    // --- CORREÇÃO APLICADA AQUI ---
    const relatedProducts = (apiRelated || []).map(p => {
        // Lógica de busca de imagem robusta
        const principalImage = p.ArquivoProdutos?.find(file => file.tipo === 'imagem' && file.principal);
        const firstImage = p.ArquivoProdutos?.find(file => file.tipo === 'imagem');
        const legacyImage = p.imagens?.[0];
        
        const imageSrc = principalImage?.url || firstImage?.url || legacyImage || 'https://placehold.co/400x400.png';

        return {
          id: p.id,
          slug: p.slug || p.id,
          name: p.nome || "Produto relacionado",
          price: p.variacoes && p.variacoes.length > 0 ? Number(p.variacoes[0].preco) : 0.00,
          imageSrc: imageSrc, // Usando a URL da imagem encontrada
          // Passando o array completo de ArquivoProdutos para o componente, caso ele precise
          ArquivoProdutos: p.ArquivoProdutos || [],
          variacoes: p.variacoes || [],
          isNew: Math.random() > 0.5,
          buttonColor: Math.random() > 0.5 ? 'purple' : 'blue',
        };
    });
    // --- FIM DA CORREÇÃO ---

    return { product, relatedProducts };

  } catch (error) {
    if (error.response && error.response.status === 404) {
      notFound();
    }
    console.error("Erro em getProductData:", error); // Adicionado para depuração
    return { product: null, relatedProducts: [] };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  const { product, relatedProducts } = await getProductData(slug);

  if (!product) {
    return (
        <main style={{ padding: '10rem 1.5rem', textAlign: 'center' }}>
            <h1>Produto não encontrado.</h1>
            <p>Não conseguimos encontrar a peça que você está procurando.</p>
        </main>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Catálogo', href: '/catalog' },
    { label: product.name, href: null },
  ];

  return (
    <main style={{ padding: '0 1.5rem 4rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      <TrackView tipo="produto" produtoId={product.id} />
      <Breadcrumb items={breadcrumbItems} />
      
      <div className={styles.productPageGrid}>
          <ProductGallery arquivoProdutos={product.arquivoProdutos} /> 
          <ProductDetails product={product} /> 
          <ProductDescription product={product} /> 
      </div>
      
      {/* O componente RelatedProducts agora receberá os dados já formatados corretamente */}
    </main>
  );
}