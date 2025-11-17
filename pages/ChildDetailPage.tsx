import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Filho, Tarefa, Recompensa, PremioResgatado } from '../types';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import StarIcon from '../components/icons/StarIcon';
import Modal from '../components/Modal';

interface ChildDetailPageProps {
  child: Filho;
  onBack: () => void;
}

interface TarefaStatus {
  [key: number]: 'feita' | 'nao-feita' | null;
}

// Chave para o localStorage baseada no ID do filho
const getStorageKey = (childId: number, data: string) => `tarefas_status_${childId}_${data}`;

const ChildDetailPage: React.FC<ChildDetailPageProps> = ({ child, onBack }) => {
  const [score, setScore] = useState(child.total || 0);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [historico, setHistorico] = useState<PremioResgatado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Estado para tarefasStatus - carregado do localStorage
  const [tarefasStatus, setTarefasStatus] = useState<TarefaStatus>({});

  // Função para carregar o status das tarefas do localStorage
  const loadTarefasStatusFromStorage = useCallback(() => {
    try {
      const storageKey = getStorageKey(child.id, dataSelecionada);
      const savedStatus = localStorage.getItem(storageKey);
      if (savedStatus) {
        return JSON.parse(savedStatus);
      }
    } catch (error) {
      console.error('Erro ao carregar status das tarefas:', error);
    }
    return {};
  }, [child.id, dataSelecionada]);

  // Função para salvar o status das tarefas no localStorage
  const saveTarefasStatusToStorage = useCallback((status: TarefaStatus) => {
    try {
      const storageKey = getStorageKey(child.id, dataSelecionada);
      localStorage.setItem(storageKey, JSON.stringify(status));
    } catch (error) {
      console.error('Erro ao salvar status das tarefas:', error);
    }
  }, [child.id, dataSelecionada]);

  // Função para carregar a pontuação atual
  const fetchScore = useCallback(async () => {
    try {
      const pontuacaoData = await api.getScore(child.id);
      setScore(pontuacaoData.total);
    } catch (error) {
      console.error("Erro ao carregar pontuação:", error);
    }
  }, [child.id]);

  // Função para inicializar o status das tarefas
  const initializeTarefasStatus = useCallback(() => {
    const savedStatus = loadTarefasStatusFromStorage();
    
    // Se não há status salvo, inicializa como null para todas as tarefas
    if (Object.keys(savedStatus).length === 0 && tarefas.length > 0) {
      const statusInicial: TarefaStatus = {};
      tarefas.forEach(tarefa => {
        statusInicial[tarefa.id] = null;
      });
      setTarefasStatus(statusInicial);
      saveTarefasStatusToStorage(statusInicial);
    } else {
      setTarefasStatus(savedStatus);
    }
  }, [tarefas, loadTarefasStatusFromStorage, saveTarefasStatusToStorage]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [tarefasData, recompensasData, historicoData] = await Promise.all([
        api.getTarefas(),
        api.getRecompensas(),
        api.getPremiosResgatados(child.id),
      ]);
      setTarefas(tarefasData);
      setRecompensas(recompensasData);
      setHistorico(historicoData);
      
      // Carrega a pontuação separadamente
      await fetchScore();
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }, [child.id, fetchScore]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (tarefas.length > 0) {
      initializeTarefasStatus();
    }
  }, [tarefas, initializeTarefasStatus]);

  // Atualiza o localStorage sempre que tarefasStatus mudar
  useEffect(() => {
    if (Object.keys(tarefasStatus).length > 0) {
      saveTarefasStatusToStorage(tarefasStatus);
    }
  }, [tarefasStatus, saveTarefasStatusToStorage]);

  const handleTarefaFeita = async (tarefa: Tarefa) => {
    try {
      // Desabilita os botões imediatamente
      const novoStatus = {
        ...tarefasStatus,
        [tarefa.id]: 'feita'
      };
      setTarefasStatus(novoStatus);

      console.log(`🎯 Adicionando 1 ponto para ${child.nome} pela tarefa: ${tarefa.nome}`);
      const descricao = `Tarefa: ${tarefa.nome} - Data: ${dataSelecionada}`;
      const novaPontuacao = await api.pontuar(child.id, 1, descricao);
      setScore(novaPontuacao.total);
      console.log(`✅ Pontuação atualizada: ${novaPontuacao.total} pontos`);
    } catch (error: any) {
      console.error("❌ Failed to add points", error);
      alert(`Erro: ${error.message}`);
      // Reabilita os botões em caso de erro
      setTarefasStatus(prev => ({
        ...prev,
        [tarefa.id]: null
      }));
    }
  };

  const handleTarefaNaoFeita = async (tarefa: Tarefa) => {
    if (window.confirm(`Deseja remover 2 pontos por não realizar a tarefa "${tarefa.nome}"?`)) {
      try {
        // Desabilita os botões imediatamente
        const novoStatus = {
          ...tarefasStatus,
          [tarefa.id]: 'nao-feita'
        };
        setTarefasStatus(novoStatus);

        console.log(`🎯 Removendo 2 pontos de ${child.nome} por não fazer: ${tarefa.nome}`);
        const descricao = `Não fez: ${tarefa.nome} - Data: ${dataSelecionada}`;
        const novaPontuacao = await api.pontuar(child.id, -2, descricao);
        setScore(novaPontuacao.total);
        console.log(`✅ Pontuação atualizada: ${novaPontuacao.total} pontos`);
      } catch (error: any) {
        console.error("❌ Failed to remove points", error);
        alert(`Erro: ${error.message}`);
        // Reabilita os botões em caso de erro
        setTarefasStatus(prev => ({
          ...prev,
          [tarefa.id]: null
        }));
      }
    }
  };

  const handleNaoRealizadoGeral = async () => {
    if (window.confirm(`Deseja remover 2 pontos por não realizar nenhuma tarefa?`)) {
      try {
        console.log(`🎯 Removendo 2 pontos de ${child.nome} - penalidade geral`);
        const descricao = `Penalidade geral - não realizou tarefas - Data: ${dataSelecionada}`;
        const novaPontuacao = await api.pontuar(child.id, -2, descricao);
        setScore(novaPontuacao.total);
        console.log(`✅ Pontuação atualizada: ${novaPontuacao.total} pontos`);
      } catch (error: any) {
        console.error("❌ Failed to remove points", error);
        alert(`Erro: ${error.message}`);
      }
    }
  };

  const handleResgatar = async (recompensa: Recompensa) => {
    if (score < recompensa.custo) {
        alert("Pontos insuficientes!");
        return;
    }
    if (window.confirm(`Tem certeza que deseja resgatar "${recompensa.nome}" por ${recompensa.custo} pontos?`)) {
        try {
            const result = await api.resgatarRecompensa(recompensa.id, child.id);
            setScore(result.pontosRestantes);
            // Refresh history
            const historicoData = await api.getPremiosResgatados(child.id);
            setHistorico(historicoData);
            alert("Recompensa resgatada com sucesso!");
        } catch (error: any) {
            alert(`Erro ao resgatar: ${error.message}`);
        }
    }
  };

  // Função para mudar a data selecionada
  const handleMudarData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = event.target.value;
    setDataSelecionada(novaData);
    // O status será carregado automaticamente pelo useEffect
  };

  // Função para obter a classe CSS baseada no status da tarefa
  const getStatusClass = (tarefaId: number) => {
    const status = tarefasStatus[tarefaId];
    switch (status) {
      case 'feita':
        return 'border-2 border-green-500 bg-green-50';
      case 'nao-feita':
        return 'border-2 border-red-500 bg-red-50';
      default:
        return 'border border-gray-200 bg-green-50';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (tarefaId: number) => {
    const status = tarefasStatus[tarefaId];
    switch (status) {
      case 'feita':
        return '✅ Tarefa realizada';
      case 'nao-feita':
        return '❌ Tarefa não realizada';
      default:
        return '';
    }
  };

  // Função para limpar o status do dia atual (para testes)
  const handleLimparStatusDia = () => {
    if (window.confirm('Deseja limpar o status das tarefas para este dia?')) {
      const statusReset: TarefaStatus = {};
      tarefas.forEach(tarefa => {
        statusReset[tarefa.id] = null;
      });
      setTarefasStatus(statusReset);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <button onClick={onBack} className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">
          &larr; Voltar
        </button>

        <div className="bg-white/90 p-6 rounded-2xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                 <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-4xl font-black">
                     {child.nome.charAt(0).toUpperCase()}
                 </div>
                 <h2 className="text-4xl font-bold text-gray-800">{child.nome}</h2>
            </div>
            <div className="text-center">
                <p className="text-lg text-gray-600">Pontuação Total</p>
                <div className="flex items-center justify-center gap-2 text-5xl font-black text-yellow-500">
                    <StarIcon className="w-12 h-12" />
                    <span>{score}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setIsHistoryModalOpen(true)} className="text-purple-600 hover:underline">
                    Ver histórico de prêmios
                  </button>
                  <button 
                    onClick={handleNaoRealizadoGeral}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Não realizou tarefas? (-2)
                  </button>
                </div>
            </div>
        </div>

        {/* Seletor de Data */}
        <div className="bg-white/90 p-4 rounded-2xl shadow-lg mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="data-selecionada" className="text-lg font-bold text-gray-700">
              📅 Data de Avaliação:
            </label>
            <input
              type="date"
              id="data-selecionada"
              value={dataSelecionada}
              onChange={handleMudarData}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-500">
              {new Date(dataSelecionada).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <button 
              onClick={handleLimparStatusDia}
              className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
              title="Limpar status deste dia"
            >
              🔄 Limpar
            </button>
          </div>
        </div>
        
        {loading ? <div className="flex justify-center"><LoadingSpinner/></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tarefas */}
              <div className="bg-white/90 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-4 text-green-600">
                    Tarefas do Dia 🚀
                    <span className="text-sm text-gray-500 ml-2">
                      ({dataSelecionada})
                    </span>
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {tarefas.map(t => {
                        const status = tarefasStatus[t.id];
                        const isDisabled = status !== null; // Desabilita se já foi avaliada
                        
                        return (
                          <div key={t.id} className={`p-4 rounded-lg transition-all duration-300 ${getStatusClass(t.id)}`}>
                            <div className="flex justify-between items-center mb-3">
                                <div>
                                    <p className="font-bold text-lg">{t.nome}</p>
                                    <p className="text-green-700 font-bold flex items-center gap-1">
                                      <StarIcon className="w-4 h-4 text-yellow-500"/> 
                                      +1 Ponto
                                    </p>
                                    {status && (
                                      <p className={`text-sm font-semibold mt-1 ${
                                        status === 'feita' ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {getStatusText(t.id)}
                                      </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleTarefaFeita(t)} 
                                disabled={isDisabled}
                                className={`flex-1 font-bold py-2 px-4 rounded-full transition-all duration-200 ${
                                  isDisabled 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
                                }`}
                              >
                                  {status === 'feita' ? '✅ Realizada' : '✅ Feito!'}
                              </button>
                              <button 
                                onClick={() => handleTarefaNaoFeita(t)} 
                                disabled={isDisabled}
                                className={`flex-1 font-bold py-2 px-4 rounded-full transition-all duration-200 ${
                                  isDisabled 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                                }`}
                              >
                                  {status === 'nao-feita' ? '❌ Não Realizada' : '❌ Não fez'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
              </div>

              {/* Recompensas */}
              <div className="bg-white/90 p-6 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-4 text-blue-600">Recompensas 🎁</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {recompensas.map(r => (
                          <div key={r.id} className="bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                              <div>
                                  <p className="font-bold text-lg">{r.nome}</p>
                                  <p className="text-blue-700 font-bold flex items-center gap-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500"/> 
                                    {r.custo} Pontos
                                  </p>
                              </div>
                              <button 
                                onClick={() => handleResgatar(r)}
                                disabled={score < r.custo}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-transform duration-200 hover:scale-110 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                  Resgatar
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
        )}

        <Modal title="Histórico de Prêmios Resgatados" isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
            {historico.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {historico.map(h => (
                        <li key={h.id} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{h.nome}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(h.data_resgate).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            <span className="font-bold text-yellow-600 flex items-center gap-1">
                                <StarIcon className="w-4 h-4"/>{h.custo}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">Nenhum prêmio foi resgatado ainda.</p>
            )}
        </Modal>

      </main>
    </>
  );
};

export default ChildDetailPage;