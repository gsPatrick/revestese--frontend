// src/components/CheckoutPage/steps/ShippingStep.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../CheckoutPage.module.css';
import { BsBoxSeam } from 'react-icons/bs';
import api from '@/services/api'; 

// Objeto de método de entrega digital padrão (duplicado aqui para clareza, pode ser importado de um util)
const DIGITAL_DELIVERY_METHOD = {
  id: 'digital_delivery',
  name: 'Entrega Digital',
  price: '0.00',
  company: { name: 'Reveste-se' },
  delivery_time: 0,
  custom_description: 'Seu produto será entregue por e-mail e estará disponível para download na sua conta.',
};

// Recebe userAddress, initialShippingMethod, cartItems, allCartItemsAreDigital
const ShippingStep = ({ onComplete, onPrev, userAddress, initialShippingMethod, cartItems, allCartItemsAreDigital }) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Efeito para lidar com pedidos 100% digitais: "auto-completa" o passo de frete
  useEffect(() => {
    if (allCartItemsAreDigital) {
      setSelectedOption(DIGITAL_DELIVERY_METHOD); // Seleciona o método digital
      setShippingOptions([DIGITAL_DELIVERY_METHOD]); // Mostra apenas essa opção
      // Chama onComplete para ir para o próximo passo.
      // Pequeno delay para evitar que o estado seja atualizado muito rápido antes da renderização.
      const timer = setTimeout(() => {
        onComplete(DIGITAL_DELIVERY_METHOD);
      }, 100); 
      return () => clearTimeout(timer);
    }
  }, [allCartItemsAreDigital, onComplete]);


  // Calcular frete usando o endereço COMPLETO fornecido e os itens do carrinho
  const calculateShipping = useCallback(async (address) => {
    // Se todos os itens são digitais, este callback não deve ser chamado
    if (allCartItemsAreDigital) return; // Garante que não executa para digitais

    if (!address || !address.cep || address.cep.replace(/\D/g, '').length !== 8) {
      setShippingOptions([]);
      setSelectedOption(null);
      setShippingError('Endereço de entrega inválido para cálculo de frete.');
      return;
    }

    setIsLoading(true);
    setShippingError('');
    setShippingOptions([]);
    setSelectedOption(null); 

    try {
      const response = await api.post('/frete/calcular', {
        enderecoDestino: { cep: address.cep },
        itens: cartItems.map(item => ({
          produtoId: item.id,
          quantidade: item.quantity,
          variacaoId: item.variation.id 
        }))
      });
      const validOptions = response.data.filter(opt => !opt.error);
      setShippingOptions(validOptions);

      let preSelected = null;
      if (initialShippingMethod) {
        preSelected = validOptions.find(opt => opt.id === initialShippingMethod.id);
      }

      if (preSelected) {
         setSelectedOption(preSelected);
      } else if (validOptions.length > 0) {
        setSelectedOption(validOptions[0]);
      } else {
        setShippingError('Nenhuma opção de frete disponível para o endereço informado.');
      }

    } catch (err) {
      console.error("Erro ao buscar frete:", err.response?.data?.message || err.message);
      setShippingError(err.response?.data?.message || 'Não foi possível calcular o frete.');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, cartItems, initialShippingMethod, allCartItemsAreDigital]);

  // Efeito para disparar o cálculo de frete quando o endereço do usuário ou itens mudam
  useEffect(() => {
    // Dispara o cálculo apenas se o userAddress está disponível, itens existem E NÃO É UM PEDIDO DIGITAL
    if (userAddress && cartItems.length > 0 && !allCartItemsAreDigital) {
       calculateShipping(userAddress);
    } else if (!userAddress && !allCartItemsAreDigital) { // Se não é digital, mas não tem endereço
       setShippingError('Por favor, retorne ao passo anterior para informar o endereço.');
       setShippingOptions([]);
       setSelectedOption(null);
    }
    // Se for allCartItemsAreDigital, o useEffect acima já cuidou disso.
  }, [userAddress, cartItems, allCartItemsAreDigital, calculateShipping]);


  const handleSelectOption = (option) => {
    setSelectedOption(option);
  };

  // Se o pedido é digital, não mostra os campos de frete, apenas uma mensagem
  if (allCartItemsAreDigital) {
    return (
        <div className={styles.infoText}>
           Todos os itens do seu pedido são digitais! Não há custo de frete.
           <p className={styles.shippingOptionPrice} style={{textAlign: 'center', marginTop: '1rem'}}>R$ 0,00</p>
            {/* Os botões de ação são desabilitados porque o onComplete já será chamado */}
           <div className={styles.stepActions}>
               <button type="button" onClick={onPrev} className={styles.prevButton}>Voltar</button>
               <button type="button" className={styles.nextButton} disabled>
                 Prosseguir Automaticamente...
               </button>
           </div>
        </div>
    );
  }

  // Renderização normal para produtos físicos
  if (!userAddress) {
      return (
          <div className={styles.infoText}>
             Aguardando informações de endereço do passo anterior...
              <div className={styles.stepActions}>
                <button type="button" onClick={onPrev} className={styles.prevButton}>Voltar</button>
                <button type="button" className={styles.nextButton} disabled={true}>
                  Ir para Pagamento
                </button>
              </div>
          </div>
      );
  }


  return (
    <div>
       <div className={styles.infoText}>
         Calculando frete para: <strong>{userAddress.cep}</strong> ({userAddress.rua}, {userAddress.numero})
       </div>

      {shippingError && <p className={styles.shippingError}>{shippingError}</p>}

      {isLoading ? (
        <p className={styles.loadingText}>Calculando opções de frete...</p>
      ) : shippingOptions.length > 0 ? (
        <div className={styles.shippingOptions}>
          {shippingOptions.map(option => (
            <label 
              key={option.id}
              className={`${styles.shippingOption} ${selectedOption?.id === option.id ? styles.selected : ''}`}
              onClick={() => handleSelectOption(option)}
            >
              <input type="radio" name="shipping" value={option.id} checked={selectedOption?.id === option.id} onChange={() => {}} />
              <div className={styles.shippingDetails}>
                <BsBoxSeam />
                <div>
                  <p>{option.name}</p>
                  <span>Prazo: {option.delivery_time} dia(s) útil(eis).</span>
                  {option.custom_description && <span className={styles.shippingOptionDesc}>{option.custom_description}</span>}
                </div>
              </div>
              <span className={styles.shippingPrice}>R$ {parseFloat(option.price).toFixed(2).replace('.',',')}</span>
            </label>
          ))}
        </div>
      ) : (
        !shippingError && <p className={styles.infoText}>Nenhuma opção de frete disponível para o endereço informado.</p>
      )}
      
      <div className={styles.stepActions}>
        <button type="button" onClick={onPrev} className={styles.prevButton}>Voltar</button>
        <button type="button" onClick={() => onComplete(selectedOption)} className={styles.nextButton} disabled={!selectedOption}>
          Ir para Pagamento
        </button>
      </div>
    </div>
  );
};

export default ShippingStep;