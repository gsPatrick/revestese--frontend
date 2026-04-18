// src/components/CartPage/CartSummary.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CartPage.module.css';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

// Objeto de método de entrega digital padrão
const DIGITAL_DELIVERY_METHOD = {
  id: 'digital_delivery',
  name: 'Entrega Digital',
  price: '0.00',
  company: { name: 'Reveste-se' },
  delivery_time: 0,
  custom_description: 'Seu produto será entregue por e-mail e estará disponível para download na sua conta.',
};

const CartSummary = ({ allUserAddresses, isLoadingAddresses }) => {
  const { cartItems } = useCart();
  const router = useRouter();

  const getDefaultAddressOption = () => {
    if (isLoadingAddresses || !allUserAddresses || allUserAddresses.length === 0) return 'novo_cep';
    const principal = allUserAddresses.find(addr => addr.principal);
    return principal ? principal.id : allUserAddresses[0].id;
  };

  const [subtotal, setSubtotal] = useState(0);
  const [selectedAddressOption, setSelectedAddressOption] = useState(getDefaultAddressOption);
  const [manualCep, setManualCep] = useState('');
  
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const allCartItemsAreDigital = cartItems.every(item => item.variation.digital === true);

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.variation.price * item.quantity, 0);
    setSubtotal(total);
  }, [cartItems]);
  
  useEffect(() => {
    if (!isLoadingAddresses) {
      setSelectedAddressOption(getDefaultAddressOption());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUserAddresses, isLoadingAddresses]);

  const calculateShipping = useCallback(async (targetCep) => {
    if (allCartItemsAreDigital) {
      setSelectedShippingMethod(DIGITAL_DELIVERY_METHOD);
      setShippingOptions([DIGITAL_DELIVERY_METHOD]);
      setShippingError('');
      setIsCalculatingShipping(false);
      return;
    }
    if (!targetCep || targetCep.replace(/\D/g, '').length !== 8) {
      setShippingOptions([]);
      setSelectedShippingMethod(null);
      if(selectedAddressOption === 'novo_cep' && manualCep.length > 0) setShippingError('Por favor, insira um CEP válido com 8 dígitos.');
      else setShippingError('');
      return;
    }
    setIsCalculatingShipping(true);
    setShippingError('');
    setShippingOptions([]);
    setSelectedShippingMethod(null);
    try {
      const response = await api.post('/frete/calcular', {
        enderecoDestino: { cep: targetCep },
        itens: cartItems.map(item => ({ produtoId: item.id, quantidade: item.quantity, variacaoId: item.variation.id }))
      });
      const validOptions = response.data.filter(opt => !opt.error);
      setShippingOptions(validOptions);
      if (validOptions.length > 0) setSelectedShippingMethod(validOptions[0]);
      else setShippingError('Não foi encontrada nenhuma opção de frete para este CEP.');
    } catch (err) {
      setShippingError(err.response?.data?.erro || 'Não foi possível calcular o frete para este CEP.');
    } finally {
      setIsCalculatingShipping(false);
    }
  }, [allCartItemsAreDigital, cartItems, selectedAddressOption, manualCep]);

  useEffect(() => {
    if (allCartItemsAreDigital) {
        setSelectedShippingMethod(DIGITAL_DELIVERY_METHOD);
        setShippingOptions([DIGITAL_DELIVERY_METHOD]);
        setShippingError('');
        setIsCalculatingShipping(false);
        return;
    }
    if (isLoadingAddresses || cartItems.length === 0) {
      setShippingOptions([]);
      setSelectedShippingMethod(null);
      return;
    }
    let targetCepToUse = '';
    if (selectedAddressOption === 'novo_cep') targetCepToUse = manualCep;
    else { 
      const selectedAddr = allUserAddresses?.find(addr => addr.id.toString() === selectedAddressOption.toString());
      if (selectedAddr) targetCepToUse = selectedAddr.cep;
    }
    if (targetCepToUse && targetCepToUse.replace(/\D/g, '').length === 8) calculateShipping(targetCepToUse);
    else {
        setShippingOptions([]);
        setSelectedShippingMethod(null);
        if (selectedAddressOption !== 'novo_cep' || manualCep.length > 0) setShippingError('Selecione um endereço ou insira um CEP para calcular o frete.');
        else setShippingError('');
    }
  }, [selectedAddressOption, manualCep, allUserAddresses, isLoadingAddresses, cartItems, allCartItemsAreDigital, calculateShipping]);

  const handleAddressOptionChange = (e) => {
    setSelectedAddressOption(e.target.value);
    setManualCep('');
    setSelectedShippingMethod(null);
    setShippingOptions([]);
    setShippingError('');
  };

  const handleManualCepChange = (e) => {
    setManualCep(e.target.value.replace(/\D/g, ''));
    setSelectedShippingMethod(null);
    setShippingOptions([]);
    setShippingError('');
  };

  const handleProceedToCheckout = () => {
    if (!allCartItemsAreDigital && !selectedShippingMethod) return;

    let finalCep = null;
    let finalShippingMethod = selectedShippingMethod;
    if (allCartItemsAreDigital) finalShippingMethod = DIGITAL_DELIVERY_METHOD;
    else if (selectedAddressOption === 'novo_cep') finalCep = manualCep;
    else {
      const selectedAddr = allUserAddresses?.find(addr => addr.id.toString() === selectedAddressOption.toString());
      finalCep = selectedAddr ? selectedAddr.cep : null;
    }
    localStorage.setItem('checkout_data', JSON.stringify({
      shippingMethod: finalShippingMethod,
      cep: finalCep,
      coupon: null, // Cupom não é mais passado daqui
      isDigitalOrder: allCartItemsAreDigital,
    }));
    router.push('/checkout');
  };

  const currentShippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
  const totalWithShipping = subtotal + currentShippingCost;

  return (
    <div className={styles.summaryContainer}>
      <h2>Resumo do Pedido</h2>
      
      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
      </div>
      
      <div className={styles.shippingSection}>
        <h3>Entrega</h3>
        {allCartItemsAreDigital ? (
          <div className={styles.infoText}>
            Todos os itens são digitais. Entrega por e-mail e download na sua conta!
            <p className={styles.shippingOptionPrice} style={{textAlign: 'center', marginTop: '1rem'}}>R$ 0,00</p>
          </div>
        ) : (
          <>
            {isLoadingAddresses ? (<p className={styles.loadingText}>Carregando endereços...</p>) : (
              <>
                {allUserAddresses && allUserAddresses.length > 0 ? (
                  <div className={styles.formGroup}>
                    <label htmlFor="address-option">Calcular frete para:</label>
                    <select id="address-option" className={styles.selectInput} value={selectedAddressOption} onChange={handleAddressOptionChange}>
                      {allUserAddresses.map(addr => (<option key={addr.id} value={addr.id}>{`${addr.apelido || addr.rua} (${addr.cep})`} {addr.principal ? ' - Principal' : ''}</option>))}
                      <option value="novo_cep">Outro CEP (Manual)</option>
                    </select>
                  </div>
                ) : (<p className={styles.infoText}>Você não tem endereços. Insira um CEP para calcular.</p>)}

                {selectedAddressOption === 'novo_cep' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="manual-cep">Digite o CEP:</label>
                    <input type="text" id="manual-cep" className={styles.textInput} placeholder="00000-000" value={manualCep} onChange={handleManualCepChange} maxLength={9} />
                  </div>
                )}

                {shippingError && <p className={styles.shippingError}>{shippingError}</p>}
                
                {isCalculatingShipping ? (<p className={styles.loadingText}>Calculando opções de frete...</p>) : (
                  shippingOptions.length > 0 ? (
                    <div className={styles.shippingOptionsList}>
                      {shippingOptions.map(option => (
                        <label key={option.id} className={styles.shippingOptionCard}>
                          <input type="radio" name="shippingMethod" value={option.id} checked={selectedShippingMethod?.id === option.id} onChange={() => setSelectedShippingMethod(option)} className={styles.shippingRadio} />
                          <div className={styles.shippingOptionDetails}>
                            <p className={styles.shippingOptionName}>{option.name}</p>
                            <span className={styles.shippingOptionTime}>Prazo: {option.delivery_time} dia(s) útil(eis)</span>
                            {option.custom_description && <span className={styles.shippingOptionDesc}>{option.custom_description}</span>}
                          </div>
                          <span className={styles.shippingOptionPrice}>R$ {parseFloat(option.price).toFixed(2).replace('.', ',')}</span>
                        </label>
                      ))}
                    </div>
                  ) : (!shippingError && selectedAddressOption && <p className={styles.infoText}>Nenhuma opção de frete para o CEP selecionado.</p>)
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className={`${styles.summaryRow} ${styles.totalRow}`}>
        <span>Total</span>
        <span>R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
      </div>

      <motion.button
        className={styles.checkoutButton}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
        onClick={handleProceedToCheckout} 
        disabled={(!selectedShippingMethod && !allCartItemsAreDigital) || isCalculatingShipping || cartItems.length === 0}
      >
        Ir para o Pagamento
      </motion.button>
    </div>
  );
};

export default CartSummary;