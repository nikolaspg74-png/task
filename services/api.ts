import { API_URL } from '../constants';
import type { Filho, Tarefa, Recompensa, Pontuacao, PremioResgatado } from '../types';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  console.log(`🌐 Fazendo requisição para: ${url}`);
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Headers para bypass de tunnels
  if (API_URL.includes('ngrok') || API_URL.includes('loca.lt')) {
    headers.set('bypass-tunnel-reminder', 'true');
    headers.set('User-Agent', 'TaskSparkle-API/1.0');
  }
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const response = await fetch(url, { 
      ...options, 
      headers,
      mode: 'cors',
    });

    // 🔥 PRIMEIRO verifica se é HTML
    const responseText = await response.text();
    
    if (responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.includes('ngrok') ||
        responseText.includes('Tunnel') ||
        responseText.includes('502 Bad Gateway') ||
        responseText.includes('This site can’t be reached')) {
      
      console.error('❌ Tunnel retornando página HTML:', responseText.substring(0, 500));
      throw new Error(`BACKEND NÃO CONECTADO: O servidor não está respondendo. Verifique se:
1. Backend está rodando: node server.js
2. Ngrok está na porta 3000: ngrok http 3000
3. Acesse manualmente: ${url}`);
    }

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status}:`, responseText);
      throw new Error(responseText || `Erro ${response.status}`);
    }
    
    if (response.status === 204) {
      return null as T;
    }

    // Só tenta parse JSON se não for HTML
    try {
      return JSON.parse(responseText) as T;
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', responseText);
      throw new Error('Resposta inválida do servidor - não é JSON válido');
    }
  } catch (error) {
    console.error(`💥 Erro de conexão em ${url}:`, error);
    
    if (error instanceof SyntaxError) {
      throw new Error('Servidor retornou HTML em vez de JSON. BACKEND PROVAVELMENTE NÃO ESTÁ RODANDO.');
    }
    
    throw error;
  }
};

// ... o resto das funções permanecem iguais
export const registerUser = (nome: string, email: string, senha: string): Promise<{ message: string }> => {
  return request('/auth/registrar', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });
};

export const loginUser = (email: string, senha: string): Promise<{ message: string; token: string; nome: string }> => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
};

export const getFilhos = (): Promise<Filho[]> => {
  return request('/filhos');
};

export const createFilho = (nome: string): Promise<{ message: string, filho: Filho }> => {
  return request('/filhos', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  });
};

export const getTarefas = (): Promise<Tarefa[]> => {
  return request('/tarefas');
};

export const getRecompensas = (): Promise<Recompensa[]> => {
  return request('/recompensas');
};

export const getScore = (filho_id: number): Promise<Pontuacao> => {
  return request(`/pontuacao/${filho_id}`);
};

export const pontuar = (filho_id: number, valor: number, descricao?: string): Promise<Pontuacao> => {
  const body: any = { 
    filho_id, 
    valor 
  };
  
  if (descricao) {
    body.descricao = descricao;
  }
  
  return request('/pontuar', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getPremiosResgatados = (filho_id: number): Promise<PremioResgatado[]> => {
  return request(`/premios-resgatados/${filho_id}`);
};

export const resgatarRecompensa = (id: number, filho_id: number): Promise<{ message: string, pontosRestantes: number }> => {
  return request('/resgatar', {
    method: 'POST',
    body: JSON.stringify({ id, filho_id }),
  });
};

export const createTarefa = (nome: string, valor: number): Promise<{ message: string, tarefa: Tarefa }> => {
  return request('/tarefas', {
    method: 'POST',
    body: JSON.stringify({ nome, valor }),
  });
};

export const createRecompensa = (nome: string, custo: number): Promise<{ message: string, recompensa: Recompensa }> => {
  return request('/recompensas', {
    method: 'POST',
    body: JSON.stringify({ nome, custo }),
  });
};

export const deleteTarefa = (id: number): Promise<{ message: string }> => {
  return request(`/tarefas/${id}`, {
    method: 'DELETE',
  });
};

export const deleteRecompensa = (id: number): Promise<{ message: string }> => {
  return request(`/recompensas/${id}`, {
    method: 'DELETE',
  });
};