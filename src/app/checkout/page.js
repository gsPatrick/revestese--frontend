// src/app/checkout/page.js

'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import Breadcrumb from '@/components/SubscriptionPage/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

import CheckoutSteps from '@/components/CheckoutPage/CheckoutSteps';
import OrderSummary from '@/components/CheckoutPage/OrderSummary';
import StepIndicator from '@/components/CheckoutPage/StepIndicator';

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { cartItems } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [initialCheckoutData, setInitialCheckoutData] = useState(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  const [finalUserData, setFinalUserData] = useState(null);
  const [finalShippingMethod, setFinalShippingMethod] = useState(null);
  
  // --- ESTADO DO CUPOM AGORA VIVE AQUI ---
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  // ----------------------------------------

  const allCartItemsAreDigital = cartItems.every(item => item.variation.digital === true);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }
    
    if (typeof window !== 'undefined' && !hasLoadedInitialData) {
       const storedData = localStorage.getItem('checkout_data');
       if (storedData) {
         try {
            const parsedData = JSON.parse(storedData);
            setInitialCheckoutData(parsedData);
            setFinalShippingMethod(parsedData.shippingMethod);
            localStorage.removeItem('checkout_data');
         } catch(error) {
            console.error("Erro ao parsear dados iniciais do checkout:", error);
            localStorage.removeItem('checkout_data');
            setInitialCheckoutData(null);
         }
       }
       setHasLoadedInitialData(true);
    }
  }, [cartItems, router, hasLoadedInitialData]);

  // Função para validar o cupom (não aplica, apenas verifica)
  const handleApplyCoupon = async (subtotal) => {
    if (!couponCode.trim()) {
      setCouponError('Por favor, digite um código de cupom.');
      setAppliedCoupon(null);
      return;
    }
    setIsApplyingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);
    try {
      const totalItemsQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const response = await api.post('/cupons/validar', {
        codigo: couponCode,
        total: subtotal,
        quantidadeItens: totalItemsQuantity,
      });
      if (response.data.valido) {
        setAppliedCoupon(response.data.cupom);
      } else {
        setCouponError(response.data.erro || 'Cupom inválido.');
      }
    } catch (err) {
      setCouponError(err.response?.data?.erro || 'Não foi possível aplicar o cupom.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Meu Carrinho', href: '/cart' },
    { label: 'Finalizar Compra', href: null },
  ];

  if (cartItems.length === 0 && hasLoadedInitialData) {
    return null; 
  }

  return (
    <main className={styles.mainContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.checkoutHeader}>
        <h1>Finalizar Compra</h1>
        <p>Você está quase lá. Conclua seu pedido com segurança.</p>
      </div>

      <StepIndicator currentStep={currentStep} />
      
      <div className={styles.checkoutLayout}>
        <div className={styles.stepsColumn}>
          <CheckoutSteps 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            isAuthenticated={isAuthenticated} 
            isAuthLoading={isAuthLoading} 
            initialCheckoutData={initialCheckoutData}
            onUserDataComplete={(data) => {
                setFinalUserData(data);
                // Reseta o cupom se o usuário for alterado, forçando nova validação
                setAppliedCoupon(null); 
                setCouponCode('');
                setCouponError('');
            }}
            onShippingComplete={(method) => setFinalShippingMethod(method)}
            finalAppliedCoupon={appliedCoupon} // Passa o cupom validado para o passo de pagamento
            allCartItemsAreDigital={allCartItemsAreDigital}
          />
        </div>
        <div className={styles.summaryColumn}>
          <OrderSummary 
             cartItems={cartItems}
             selectedShippingMethod={finalShippingMethod} 
             allCartItemsAreDigital={allCartItemsAreDigital}
             // --- PROPS DO CUPOM PASSADAS PARA O RESUMO ---
             couponCode={couponCode}
             setCouponCode={setCouponCode}
             appliedCoupon={appliedCoupon}
             setAppliedCoupon={setAppliedCoupon}
             couponError={couponError}
             isApplyingCoupon={isApplyingCoupon}
             handleApplyCoupon={handleApplyCoupon}
             isStepOneCompleted={!!finalUserData} // Desabilita o cupom se o passo 1 não foi concluído
          />
        </div>
      </div>
    </main>
  );
}