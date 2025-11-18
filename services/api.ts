import { API_URL } from '../constants';
import type { Filho, Tarefa, Recompensa, Pontuacao, PremioResgatado } from '../types';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  console.log(`🔧 Fazendo requisição para: ${url}`);
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // 🔥 HEADERS PARA BYPASS DO NGROK - COMPLETOS E CORRETOS
  if (API_URL.includes('loca.lt') || API_URL.includes('ngrok')) {
    headers.set('bypass-tunnel-reminder', 'true');
    headers.set('ngrok-skip-browser-warning', 'true'); // ← ESSE ESTAVA FALTANDO!
    headers.set('User-Agent', 'TaskSparkle-App/1.0');
    console.log('🔧 Headers de bypass do ngrok adicionados');
  }
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
    console.log('🔧 Token JWT adicionado');
  }

  try {
    console.log('🔧 Headers enviados:', Object.fromEntries(headers));
    
    const response = await fetch(url, { 
      ...options, 
      headers,
      mode: 'cors',
    });

    const responseText = await response.text();
    
    // 🔥 DETECTA SE É UMA PÁGINA HTML DE ERRO DO TUNNEL - ATUALIZADO
    if (responseText.trim().startsWith('<!DOCTYPE') || 
        responseText.includes('ngrok') ||
        responseText.includes('Tunnel website ahead!') ||
        responseText.includes('localtunnel') ||
        responseText.includes('This site can’t be reached') ||
        responseText.includes('You are about to visit:') || // ← NOVA VERIFICAÇÃO
        responseText.includes('ngrok-skip-browser-warning')) {
      
      console.error('❌ Tunnel bloqueando requisição - Página HTML detectada');
      console.error('📄 Conteúdo da resposta:', responseText.substring(0, 500));
      throw new Error('Tunnel bloqueando acesso. Verifique se o backend está rodando na porta 3000.');
    }

    if (!response.ok) {
      console.error(`❌ Erro ${response.status}: ${responseText}`);
      throw new Error(responseText || `Erro ${response.status}: ${response.statusText}`);
    }
    
    if (response.status === 204) {
      return null as T;
    }

    // Parse do JSON apenas se não for HTML
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error(`❌ Erro de conexão em ${url}:`, error);
    
    // Melhora a mensagem de erro baseada no tipo de erro
    if (error instanceof SyntaxError) {
      throw new Error('Servidor retornou HTML em vez de JSON. Verifique se o backend está rodando corretamente.');
    }
    
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar ao servidor. Verifique: 1) Backend está rodando, 2) URL está correta, 3) Tunnel está ativo.');
    }
    
    throw error;
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