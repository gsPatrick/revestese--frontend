// src/components/CheckoutPage/steps/UserInfoStep.js

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from '../CheckoutPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext'; 

// Recebe onComplete, isAuthenticated, isAuthLoading, userAddresses, isLoadingAddresses, onLoginOrRegisterSuccess, initialCep, allCartItemsAreDigital
const UserInfoStep = ({ onComplete, isAuthenticated, isAuthLoading, userAddresses, isLoadingAddresses, onLoginOrRegisterSuccess, initialCep, allCartItemsAreDigital }) => {
  const { login: authLogin, user: authUser } = useAuth(); 

  const [showAuthForms, setShowAuthForms] = useState(false); 
  const [isLoginMode, setIsLoginMode] = useState(true); 

  const [addressFormData, setAddressFormData] = useState({
    apelido: '', 
    rua: '', 
    numero: '', 
    complemento: '',
    bairro: '', 
    cidade: '', 
    estado: '', 
    cep: initialCep || ''
  });

  const [loginCreds, setLoginCreds] = useState({ email: '', senha: '' });
  const [registerCreds, setRegisterCreds] = useState({ nome: '', email: '', senha: '' });

  const [selectedExistingAddressId, setSelectedExistingAddressId] = useState('');

  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [addressFormError, setAddressFormError] = useState(''); 
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');


  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
         setShowAuthForms(false); 
         if (userAddresses.length > 0) {
            const principal = userAddresses.find(addr => addr.principal) || userAddresses[0];
            setSelectedExistingAddressId(principal.id);
             setAddressFormData({
                apelido: principal.apelido || '', rua: principal.rua || '', numero: principal.numero || '',
                complemento: principal.complemento || '', bairro: principal.bairro || '', cidade: principal.cidade || '',
                estado: principal.estado || '', cep: principal.cep || ''
             });
         } else {
             setSelectedExistingAddressId('new_address'); 
              setAddressFormData(prev => ({ ...prev, cep: initialCep || '' })); 
         }

      } else {
        setShowAuthForms(true); 
         if (!initialCep) {
             setAddressFormData({
                apelido: '', rua: '', numero: '', complemento: '',
                bairro: '', cidade: '', estado: '', cep: ''
             });
         } else {
             setAddressFormData(prev => ({
                ...prev,
                apelido: '', rua: '', numero: '', complemento: '',
                bairro: '', cidade: '', estado: ''
             }));
         }
      }
    }
  }, [isAuthenticated, isAuthLoading, userAddresses, initialCep]); 
  
  useEffect(() => {
      if (!isAuthenticated && showAuthForms) {
          setAddressFormData({
             apelido: '', rua: '', numero: '', complemento: '',
             bairro: '', cidade: '', estado: '', cep: initialCep || ''
          });
          setCepError('');
      }
  }, [isLoginMode, isAuthenticated, showAuthForms, initialCep]);


  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setAddressFormData(prev => ({ ...prev, cep }));
    setCepError('');

    if (cep.length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await api.post('/enderecos/validar-cep', { cep });
        setAddressFormData(prev => ({
          ...prev,
          rua: response.data.logradouro,
          bairro: response.data.bairro,
          cidade: response.data.localidade,
          estado: response.data.uf, 
          complemento: response.data.complemento || '',
        }));
      } catch (error) {
        setCepError('CEP não encontrado ou inválido.');
        console.error("Erro ao buscar CEP", error);
         setAddressFormData(prev => ({ 
            ...prev,
            rua: '', bairro: '', cidade: '', estado: '', complemento: ''
         }));
      } finally {
        setIsSearchingCep(false);
      }
    } else {
         setAddressFormData(prev => ({ 
            ...prev,
            rua: '', bairro: '', cidade: '', estado: '', complemento: ''
         }));
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginCredsChange = (e) => {
    const { name, value } = e.target;
    setLoginCreds(prev => ({ ...prev, [name]: value }));
    setLoginError(''); 
  };

  const handleRegisterCredsChange = (e) => {
    const { name, value } = e.target;
    setRegisterCreds(prev => ({ ...prev, [name]: value }));
    setRegisterError(''); 
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingAuth(true);
    setLoginError('');
    try {
      const response = await api.post('/auth/login', loginCreds);
      authLogin(response.data.usuario, response.data.token, null);
      onLoginOrRegisterSuccess(); 
    } catch (err) {
      setLoginError(err.response?.data?.erro || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingAuth(true);
    setRegisterError('');
    try {
      const response = await api.post('/auth/register', registerCreds);
      authLogin(response.data.usuario, response.data.token, null);
      onLoginOrRegisterSuccess(); 
    } catch (err) {
      setRegisterError(err.response?.data?.erro || 'Erro no cadastro. Tente novamente.');
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleAddressFormSubmit = async (e) => {
    e.preventDefault();
    setAddressFormError('');

    let finalAddressData = null;
    let userContactData = null; 

    // NOVO: Se o pedido é 100% digital, o endereço pode ser nulo/simples
    if (allCartItemsAreDigital) {
      // Se não está logado, precisa pelo menos do nome e email para o pedido
      if (!isAuthenticated && (!registerCreds.nome || !registerCreds.email)) {
        setAddressFormError('Por favor, informe seu nome e email para contato.');
        return;
      }
      // Para pedidos digitais, o endereço é opcional e pode ser um objeto vazio/simples
      finalAddressData = {}; // Ou { cep: '00000000' } se o backend exigir CEP mesmo para digital
      userContactData = isAuthenticated ? { nome: authUser?.nome, email: authUser?.email } : { nome: registerCreds.nome, email: registerCreds.email };
      onComplete({ ...userContactData, ...finalAddressData });
      return;
    }

    // Lógica existente para pedidos FÍSICOS
    if (isAuthenticated) {
        const selectedId = e.target.elements['address-selection']?.value; 

        if (userAddresses.length > 0 && selectedId && selectedId !== 'new_address') {
            const selectedAddress = userAddresses.find(addr => addr.id == selectedId);
            if (selectedAddress) {
                if (!selectedAddress.principal) {
                    try {
                        await api.post(`/enderecos/${selectedAddress.id}/principal`);
                    } catch (error) {
                        console.warn("Falha ao definir endereço como principal:", error);
                    }
                }
                finalAddressData = selectedAddress; 
            } else {
                setAddressFormError('Endereço selecionado não encontrado.');
                return;
            }
        } else {
             if (!addressFormData.rua || !addressFormData.numero || !addressFormData.bairro || !addressFormData.cidade || !addressFormData.estado || !addressFormData.cep) {
                 setAddressFormError('Por favor, preencha todos os campos obrigatórios do endereço.');
                 return;
             }
             if (addressFormData.cep.replace(/\D/g, '').length !== 8) {
                  setAddressFormError('CEP inválido.');
                  return;
             }

            setIsProcessingAuth(true); 
            try {
                 const newAddressPayload = { 
                     ...addressFormData,
                     principal: e.target.elements['principal-checkbox']?.checked || userAddresses.length === 0 
                 };
                const response = await api.post('/enderecos', newAddressPayload);
                onLoginOrRegisterSuccess(); 
                finalAddressData = response.data; 
            } catch (err) {
                console.error("Erro ao criar novo endereço:", err.response?.data || err.message);
                setAddressFormError(err.response?.data?.erro || 'Erro ao salvar o novo endereço. Verifique os dados.');
                setIsProcessingAuth(false);
                return; 
            } finally {
                 setIsProcessingAuth(false);
            }
        }

        userContactData = {
             email: authUser?.email,
             nome: authUser?.nome,
        };


    } else { // Não autenticado, deve preencher nome/email e endereço
        if (!registerCreds.nome || !registerCreds.email || !addressFormData.rua || !addressFormData.numero || !addressFormData.bairro || !addressFormData.cidade || !addressFormData.estado || !addressFormData.cep) {
             setAddressFormError('Por favor, preencha todos os dados de contato e endereço.');
             return;
        }
         if (addressFormData.cep.replace(/\D/g, '').length !== 8) {
              setAddressFormError('CEP inválido.');
              return;
         }

        finalAddressData = addressFormData; 
        userContactData = {
            nome: registerCreds.nome,
            email: registerCreds.email,
        };
    }

     onComplete({
         ...userContactData, 
         ...finalAddressData 
     });
  };

  const handleAddressSelectionChange = (e) => {
      const selectedId = e.target.value;
      setSelectedExistingAddressId(selectedId);
      if (selectedId !== 'new_address') {
          const selectedAddr = userAddresses.find(addr => addr.id == selectedId);
          if (selectedAddr) {
               setAddressFormData({
                  apelido: selectedAddr.apelido || '', rua: selectedAddr.rua || '', numero: selectedAddr.numero || '',
                  complemento: selectedAddr.complemento || '', bairro: selectedAddr.bairro || '', cidade: selectedAddr.cidade || '',
                  estado: selectedAddr.estado || '', cep: selectedAddr.cep || ''
               });
          }
      } else {
           setAddressFormData({
                apelido: '', rua: '', numero: '', complemento: '',
                bairro: '', cidade: '', estado: '', cep: initialCep || '' 
           });
           setCepError(''); 
      }
  };


  let content;

  if (isAuthLoading) {
    content = <p className={styles.loadingText}>Verificando seus dados...</p>;
  } else if (!isAuthenticated && showAuthForms) {
    content = (
      <>
        <div className={styles.loginToggle}>
          <p>Já tem uma conta?</p>
          <button type="button" onClick={() => setIsLoginMode(true)} disabled={isProcessingAuth}>Entre</button>
          <p>Ou, é novo por aqui?</p>
          <button type="button" onClick={() => setIsLoginMode(false)} disabled={isProcessingAuth}>Cadastre-se</button>
        </div>
        <AnimatePresence mode="wait">
          {isLoginMode ? (
            <motion.form key="loginForm" onSubmit={handleLoginSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className={styles.subheading}>Entrar para Continuar</h4>
              <div className={styles.formGroup}>
                <label htmlFor="login-email">Email</label>
                <input type="email" id="login-email" name="email" value={loginCreds.email} onChange={handleLoginCredsChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="login-senha">Senha</label>
                <input type="password" id="login-senha" name="senha" value={loginCreds.senha} onChange={handleLoginCredsChange} required />
              </div>
              {loginError && <p className={styles.errorMessage}>{loginError}</p>}
              <button type="submit" className={styles.loginButton} disabled={isProcessingAuth}>
                {isProcessingAuth ? 'Entrando...' : 'Entrar'}
              </button>
            </motion.form>
          ) : (
            <motion.form key="registerForm" onSubmit={handleRegisterSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h4 className={styles.subheading}>Cadastre-se para Continuar</h4>
               <div className={styles.formGroup}>
                 <label htmlFor="register-nome">Seu Nome</label>
                 <input type="text" id="register-nome" name="nome" value={registerCreds.nome} onChange={handleRegisterCredsChange} required />
               </div>
              <div className={styles.formGroup}>
                <label htmlFor="register-email">Email</label>
                <input type="email" id="register-email" name="email" value={registerCreds.email} onChange={handleRegisterCredsChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="register-senha">Crie uma Senha</label>
                <input type="password" id="register-senha" name="senha" value={registerCreds.senha} onChange={handleRegisterCredsChange} required />
              </div>
              {registerError && <p className={styles.errorMessage}>{registerError}</p>}
              <button type="submit" className={styles.loginButton} disabled={isProcessingAuth}>
                {isProcessingAuth ? 'Cadastrando...' : 'Criar Conta'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </>
    );
  } else { 
    content = (
      <form onSubmit={handleAddressFormSubmit}>
        <h4 className={styles.subheading}>Informações de Contato e Endereço de Entrega</h4>

         {!isAuthenticated ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div className={styles.formGroup}>
                   <label htmlFor="contact-nome">Seu Nome</label>
                   <input type="text" id="contact-nome" name="nome" value={registerCreds.nome} onChange={handleRegisterCredsChange} required />
                 </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contact-email">Email para Contato</label>
                  <input type="email" id="contact-email" name="email" value={registerCreds.email} onChange={handleRegisterCredsChange} required />
                </div>
             </motion.div>
         ) : (
              <p className={styles.infoText}>
                  Você está logado como <strong>{authUser?.nome}</strong> ({authUser?.email}). 
                  Os dados de contato serão vinculados à sua conta.
              </p>
         )}

        {/* NOVO: Esconde a seleção/form de endereço se o pedido for 100% digital */}
        {!allCartItemsAreDigital && (
          <>
            {isLoadingAddresses ? (
              <p className={styles.loadingText}>Carregando endereços cadastrados...</p>
            ) : isAuthenticated && userAddresses.length > 0 ? ( 
              <motion.div key="selectAddress" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.formGroup}>
                  <label htmlFor="address-selection">Selecione um Endereço:</label>
                  <select 
                    id="address-selection" 
                    name="address-selection" 
                    className={styles.selectInput}
                    value={selectedExistingAddressId} 
                    onChange={handleAddressSelectionChange}
                  >
                    {userAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.apelido || `${addr.rua}, ${addr.numero}`} ({addr.cep}) {addr.principal ? ' (Principal)' : ''}
                      </option>
                    ))}
                    <option value="new_address">Adicionar Novo Endereço</option>
                  </select>
                </div>
              </motion.div>
            ) : null }
            
            {(selectedExistingAddressId === 'new_address' || userAddresses.length === 0) && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key="manualAddressForm" 
                >
                    <h4 className={styles.subheading}>Detalhes do {isAuthenticated && (userAddresses.length > 0 ? 'Novo ' : '')} Endereço</h4>
                    <div className={styles.formGroup}>
                        <label htmlFor="address-apelido">Apelido (ex: Casa, Trabalho)</label>
                        <input type="text" id="address-apelido" name="apelido" value={addressFormData.apelido} onChange={handleAddressFormChange} />
                    </div>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="endereco-cep">CEP</label>
                        <input type="text" id="endereco-cep" name="cep" value={addressFormData.cep} onChange={handleCepChange} maxLength={9} placeholder="00000-000" required />
                        {isSearchingCep && <p className={styles.cepStatus}>Buscando...</p>}
                        {cepError && <p className={styles.cepError}>{cepError}</p>}
                        </div>
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="endereco-rua">Rua / Logradouro</label>
                        <input type="text" id="endereco-rua" name="rua" value={addressFormData.rua} onChange={handleAddressFormChange} required />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="endereco-numero">Número</label>
                        <input type="text" id="endereco-numero" name="numero" value={addressFormData.numero} onChange={handleAddressFormChange} required />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="endereco-complemento">Complemento (Opcional)</label>
                        <input type="text" id="endereco-complemento" name="complemento" value={addressFormData.complemento} onChange={handleAddressFormChange} />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="endereco-bairro">Bairro</label>
                        <input type="text" id="endereco-bairro" name="bairro" value={addressFormData.bairro} onChange={handleAddressFormChange} required />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="endereco-cidade">Cidade</label>
                        <input type="text" id="endereco-cidade" name="cidade" value={addressFormData.cidade} onChange={handleAddressFormChange} required />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="endereco-estado">Estado (UF)</label>
                        <input type="text" id="endereco-estado" name="estado" value={addressFormData.estado} onChange={handleAddressFormChange} maxLength={2} required />
                        </div>
                        {isAuthenticated && selectedExistingAddressId === 'new_address' && (
                            <div className={`${styles.checkboxGroup} ${styles.fullWidth}`}>
                                <input type="checkbox" id="principal-checkbox" name="principal" />
                                <label htmlFor="principal-checkbox">Tornar este o endereço principal</label>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
          </>
        )}

        {addressFormError && <p className={styles.errorMessage}>{addressFormError}</p>}

        <div className={styles.stepActions}>
          <button type="submit" className={styles.nextButton} disabled={isProcessingAuth || isSearchingCep}>
             {isProcessingAuth ? 'Processando...' : 'Confirmar Endereço e Continuar'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <AnimatePresence mode="wait">
       <motion.div key={isAuthenticated ? "authenticatedFlow" : (showAuthForms ? "authForms" : "addressFormOnly")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
         {content}
       </motion.div>
    </AnimatePresence>
  );
};

export default UserInfoStep;