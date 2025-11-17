import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import type { Filho } from '../types';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import StarIcon from '../components/icons/StarIcon';

interface DashboardPageProps {
  onSelectChild: (child: Filho) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectChild }) => {
  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newTarefa, setNewTarefa] = useState({ nome: '', valor: 1 });
  const [newRecompensa, setNewRecompensa] = useState({ nome: '', custo: 5 });
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [recompensas, setRecompensas] = useState<any[]>([]);

  const fetchFilhos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getFilhos();
      setFilhos(data);
    } catch (err: any) {
      setError('Falha ao buscar filhos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTarefas = useCallback(async () => {
    try {
      const data = await api.getTarefas();
      setTarefas(data);
    } catch (err: any) {
      console.error('Erro ao buscar tarefas:', err);
    }
  }, []);

  const fetchRecompensas = useCallback(async () => {
    try {
      const data = await api.getRecompensas();
      setRecompensas(data);
    } catch (err: any) {
      console.error('Erro ao buscar recompensas:', err);
    }
  }, []);

  useEffect(() => {
    fetchFilhos();
    fetchTarefas();
    fetchRecompensas();
  }, [fetchFilhos, fetchTarefas, fetchRecompensas]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    try {
      await api.createFilho(newChildName);
      setNewChildName('');
      fetchFilhos();
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar filho.');
    }
  };

  const handleAddTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarefa.nome.trim()) return;
    try {
      await api.createTarefa(newTarefa.nome, newTarefa.valor);
      setNewTarefa({ nome: '', valor: 1 });
      fetchTarefas();
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar tarefa.');
    }
  };

  const handleAddRecompensa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecompensa.nome.trim()) return;
    try {
      await api.createRecompensa(newRecompensa.nome, newRecompensa.custo);
      setNewRecompensa({ nome: '', custo: 5 });
      fetchRecompensas();
    } catch (err: any) {
      setError(err.message || 'Falha ao adicionar recompensa.');
    }
  };

  const handleDeleteTarefa = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta tarefa?')) {
      try {
        await api.deleteTarefa(id);
        fetchTarefas();
      } catch (err: any) {
        setError(err.message || 'Falha ao deletar tarefa.');
      }
    }
  };

  const handleDeleteRecompensa = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar esta recompensa?')) {
      try {
        await api.deleteRecompensa(id);
        fetchRecompensas();
      } catch (err: any) {
        setError(err.message || 'Falha ao deletar recompensa.');
      }
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {/* Painel de Administração */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-700">Painel de Administração</h2>
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {showAdminPanel ? '👁️ Ocultar' : '⚙️ Administrar'}
            </button>
          </div>

          {showAdminPanel && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Adicionar Tarefa */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-green-700">➕ Nova Tarefa</h3>
                <form onSubmit={handleAddTarefa} className="space-y-3">
                  <input
                    type="text"
                    value={newTarefa.nome}
                    onChange={(e) => setNewTarefa({ ...newTarefa, nome: e.target.value })}
                    placeholder="Nome da tarefa"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Valor:</label>
                    <input
                      type="number"
                      value={newTarefa.valor}
                      onChange={(e) => setNewTarefa({ ...newTarefa, valor: Number(e.target.value) })}
                      min="1"
                      className="w-20 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <span className="text-yellow-500 flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                    </span>
                  </div>
                  <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full transition">
                    Adicionar Tarefa
                  </button>
                </form>
              </div>

              {/* Adicionar Recompensa */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-blue-700">🎁 Nova Recompensa</h3>
                <form onSubmit={handleAddRecompensa} className="space-y-3">
                  <input
                    type="text"
                    value={newRecompensa.nome}
                    onChange={(e) => setNewRecompensa({ ...newRecompensa, nome: e.target.value })}
                    placeholder="Nome da recompensa"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Custo:</label>
                    <input
                      type="number"
                      value={newRecompensa.custo}
                      onChange={(e) => setNewRecompensa({ ...newRecompensa, custo: Number(e.target.value) })}
                      min="1"
                      className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-yellow-500 flex items-center gap-1">
                      <StarIcon className="w-4 h-4" />
                    </span>
                  </div>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full transition">
                    Adicionar Recompensa
                  </button>
                </form>
              </div>

              {/* Lista de Tarefas */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-green-700">📝 Tarefas Existentes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tarefas.map(tarefa => (
                    <div key={tarefa.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span>{tarefa.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />{tarefa.valor}
                        </span>
                        <button
                          onClick={() => handleDeleteTarefa(tarefa.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Recompensas */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-blue-700">🏆 Recompensas Existentes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {recompensas.map(recompensa => (
                    <div key={recompensa.id} className="flex justify-between items-center bg-white p-2 rounded">
                      <span>{recompensa.nome}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />{recompensa.custo}
                        </span>
                        <button
                          onClick={() => handleDeleteRecompensa(recompensa.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Adicionar Criança */}
        <div className="bg-white/90 p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Adicionar Criança</h2>
          <form onSubmit={handleAddChild} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="Nome da criança"
              className="flex-grow px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105">
              Adicionar
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Lista de Crianças */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Minhas Crianças</h2>
          {loading ? (
            <div className="flex justify-center"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filhos.map((filho) => (
                <div
                  key={filho.id}
                  onClick={() => onSelectChild(filho)}
                  className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
                    {filho.nome.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{filho.nome}</h3>
                  <div className="flex items-center justify-center gap-1 text-2xl font-black text-yellow-500">
                    <StarIcon className="w-6 h-6" />
                    <span>{filho.total || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">pontos</p>
                </div>
              ))}
            </div>
          )}
          {!loading && filhos.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Nenhuma criança cadastrada ainda. Adicione uma acima!</p>
          )}
        </div>
      </main>
    </>
  );
};

export default DashboardPage;