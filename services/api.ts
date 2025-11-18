import { API_URL } from '../constants';
import type { Filho, Tarefa, Recompensa, Pontuacao, PremioResgatado } from '../types';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  console.log(`Fazendo requisição para: ${url}`); // Debug
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // 🔥 ADICIONE ESTES HEADERS PARA BYPASS DO TUNNEL
  if (API_URL.includes('loca.lt')) {
    headers.set('bypass-tunnel-reminder', 'true');
    headers.set('User-Agent', 'TaskSparkle-App/1.0');
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

    if (!response.ok) {
      const errorText = await response.text();
      
      // 🔥 DETECTA SE É A PÁGINA DO TUNNEL
      if (errorText.includes('Tunnel website ahead!') || errorText.includes('localtunnel')) {
        throw new Error('Tunnel bloqueando requisição. Acesse https://task.loca.lt no navegador e digite o IP: 177.86.70.46');
      }
      
      console.error(`Erro ${response.status}: ${errorText}`);
      throw new Error(errorText || `Erro ${response.status}: ${response.statusText}`);
    }
    
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro de conexão em ${url}:`, error);
    throw new Error(`Não foi possível conectar ao servidor. Verifique se o backend está rodando.`);
  }
};

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

// Nova função para obter pontuação
export const getScore = (filho_id: number): Promise<Pontuacao> => {
  return request(`/pontuacao/${filho_id}`);
};

export const pontuar = (filho_id: number, valor: number, descricao?: string): Promise<Pontuacao> => {
  const body: any = { 
    filho_id, 
    valor 
  };
  
  // Adiciona descricao apenas se foi fornecida
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

// Criar nova tarefa
export const createTarefa = (nome: string, valor: number): Promise<{ message: string, tarefa: Tarefa }> => {
  return request('/tarefas', {
    method: 'POST',
    body: JSON.stringify({ nome, valor }),
  });
};

// Criar nova recompensa
export const createRecompensa = (nome: string, custo: number): Promise<{ message: string, recompensa: Recompensa }> => {
  return request('/recompensas', {
    method: 'POST',
    body: JSON.stringify({ nome, custo }),
  });
};

// Deletar tarefa
export const deleteTarefa = (id: number): Promise<{ message: string }> => {
  return request(`/tarefas/${id}`, {
    method: 'DELETE',
  });
};

// Deletar recompensa
export const deleteRecompensa = (id: number): Promise<{ message: string }> => {
  return request(`/recompensas/${id}`, {
    method: 'DELETE',
  });
};