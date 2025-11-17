
export interface User {
  nome: string;
}

export interface Filho {
  id: number;
  nome: string;
  usuario_id: number;
  total?: number; // Pontuação pode ser adicionada depois
}

export interface Tarefa {
  id: number;
  nome: string;
  valor: number;
  icone: string;
}

export interface Recompensa {
  id: number;
  nome: string;
  custo: number;
  icone: string;
}

export interface Pontuacao {
  total: number;
}

export interface PremioResgatado {
  id: number;
  recompensa_id: number;
  nome: string;
  custo: number;
  data_resgate: string;
  filho_id: number;
}
