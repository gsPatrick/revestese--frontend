import axios from 'axios';

const API_URL = 'https://n8n-doodledreamsbackend.r954jc.easypanel.host/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use(
  (config) => {
    // A VERIFICAÇÃO CRUCIAL: Só tenta acessar o localStorage se 'window' existir.
    // 'window' só existe no ambiente do navegador (cliente).
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('reveste_token');
      if (token) {
        // Garantir que o cabeçalho 'Authorization' está sendo montado corretamente.
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;