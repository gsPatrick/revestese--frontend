'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/components/AccountPage/AccountPage.module.css';
import Breadcrumb from '@/components/SubscriptionPage/Breadcrumb';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

// Importando TODOS os componentes da página da conta
import AccountSidebar from '@/components/AccountPage/AccountSidebar';
import AccountDashboard from '@/components/AccountPage/AccountDashboard';
import OrderHistory from '@/components/AccountPage/OrderHistory';
import FavoriteProducts from '@/components/AccountPage/FavoriteProducts';
import AccountDetails from '@/components/AccountPage/AccountDetails';
import AddressManager from '@/components/AccountPage/AddressManager';

export default function MyAccountPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Estados para armazenar os dados vindos da API
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só busca os dados se a autenticação já foi verificada e o usuário está logado
    if (!isAuthLoading && isAuthenticated) {
      const fetchAccountData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Usamos Promise.all para buscar tudo em paralelo e otimizar o tempo
          const [
            profileRes,
            ordersRes,
            favoritesRes,
            addressesRes
          ] = await Promise.all([
            api.get('/usuarios/perfil'),
            api.get('/pedidos/meus-pedidos'),
            api.get('/favoritos'),
            api.get('/enderecos'),
          ]);

          setProfileData(profileRes.data);
          setOrders(ordersRes.data.pedidos);
          setFavorites(favoritesRes.data);
          setAddresses(addressesRes.data);

        } catch (err) {
          console.error("Erro ao buscar dados da conta:", err);
          setError("Não foi possível carregar os dados da sua conta. Tente novamente mais tarde.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchAccountData();
    } else if (!isAuthLoading && !isAuthenticated) {
      // Se não estiver autenticado, encerra o carregamento
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Minha Conta', href: null },
  ];

  // Função para renderizar o conteúdo com base na view ativa
  const renderContent = () => {
    if (isLoading) {
      return <p>Carregando seus dados...</p>;
    }
    if (error) {
      return <p style={{ color: 'red' }}>{error}</p>;
    }

    switch (activeView) {
      case 'dashboard':
        return <AccountDashboard user={profileData} orders={orders} />;
      case 'orders':
        return <OrderHistory orders={orders} />;
      case 'addresses':
        return <AddressManager addresses={addresses} />;
      case 'favorites':
        return <FavoriteProducts favorites={favorites} />;
      case 'details':
        // Passa a função para atualizar o perfil após a edição
        return <AccountDetails user={profileData} onProfileUpdate={setProfileData} />;
      default:
        return <AccountDashboard user={profileData} />;
    }
  };

  // Enquanto a autenticação verifica, ou se não estiver logado, mostra uma mensagem
  if (isAuthLoading || !isAuthenticated) {
    return (
        <main className={styles.mainContainer}>
            <Breadcrumb items={breadcrumbItems} />
            <div className={styles.contentPanel}>
                <p>{isAuthLoading ? 'Verificando...' : 'Você precisa estar logado para ver esta página.'}</p>
            </div>
        </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <Breadcrumb items={breadcrumbItems} />
      <div className={styles.accountHeader}>
        <h1>Minha Conta</h1>
        <p>Olá, {user?.nome}! Bem-vindo(a) de volta ao seu espaço.</p>
      </div>
      <div className={styles.accountLayout}>
        <AccountSidebar activeView={activeView} setActiveView={setActiveView} />
        <div className={styles.contentPanel}>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}