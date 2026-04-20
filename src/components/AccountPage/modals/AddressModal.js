'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AddressModal.module.css';
import api from '@/services/api';
import { HiXMark } from 'react-icons/hi2';

const AddressModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    apelido: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    principal: false,
  });
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCepChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep }));
    setCepError('');

    if (cep.length === 8) {
      setIsSearchingCep(true);
      try {
        const response = await api.post('/enderecos/validar-cep', { cep });
        setFormData(prev => ({
          ...prev,
          rua: response.data.logradouro,
          bairro: response.data.bairro,
          cidade: response.data.cidade,
          estado: response.data.estado,
        }));
      } catch (error) {
        setCepError('CEP não encontrado ou inválido.');
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    try {
      const newAddress = await api.post('/enderecos', formData);
      onSave(newAddress.data); // Chama a função do pai para atualizar a lista
      onClose(); // Fecha o modal
    } catch (error) {
      setFormError(error.response?.data?.erro || 'Ocorreu um erro ao salvar o endereço.');
    } finally {
      setIsSaving(false);
    }
  };

  // Limpa o formulário quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
        setFormData({
            apelido: '', cep: '', rua: '', numero: '', complemento: '',
            bairro: '', cidade: '', estado: '', principal: false,
        });
        setCepError('');
        setFormError('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContainer}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
          >
            <div className={styles.modalHeader}>
              <h3>Novo Endereço</h3>
              <button onClick={onClose} className={styles.closeButton}><HiXMark /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.addressForm}>
              <div className={styles.formGroup}>
                <label htmlFor="apelido">Apelido (ex: Casa, Trabalho)</label>
                <input type="text" id="apelido" name="apelido" value={formData.apelido} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cep">CEP</label>
                <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleCepChange} maxLength={8} required />
                {isSearchingCep && <p className={styles.cepStatus}>Buscando...</p>}
                {cepError && <p className={styles.cepError}>{cepError}</p>}
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup} style={{ gridColumn: '1 / span 2' }}>
                  <label htmlFor="rua">Rua / Logradouro</label>
                  <input type="text" id="rua" name="rua" value={formData.rua} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="numero">Número</label>
                  <input type="text" id="numero" name="numero" value={formData.numero} onChange={handleChange} required />
                </div>
                 <div className={styles.formGroup}>
                  <label htmlFor="complemento">Complemento (Opcional)</label>
                  <input type="text" id="complemento" name="complemento" value={formData.complemento} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bairro">Bairro</label>
                <input type="text" id="bairro" name="bairro" value={formData.bairro} onChange={handleChange} required />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="cidade">Cidade</label>
                  <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="estado">Estado (UF)</label>
                  <input type="text" id="estado" name="estado" value={formData.estado} onChange={handleChange} maxLength={2} required />
                </div>
              </div>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="principal" name="principal" checked={formData.principal} onChange={handleChange} />
                <label htmlFor="principal">Tornar este o endereço principal</label>
              </div>
              {formError && <p className={styles.formError}>{formError}</p>}
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
                <button type="submit" className={styles.saveButton} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Endereço'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;