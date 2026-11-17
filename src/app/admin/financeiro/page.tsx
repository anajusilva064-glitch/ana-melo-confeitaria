'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { FinancialTransaction, TransactionType } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from 'lucide-react';

export default function AdminFinanceiroPage() {
  const { transactions, addTransaction, deleteTransaction } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Insumos & Matéria-Prima');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Cálculos Gerais
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numericAmount = parseFloat(amount.replace(',', '.')) || 0;

    addTransaction({
      type,
      category,
      description: description.trim(),
      amount: numericAmount,
      date: new Date().toISOString(),
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Fluxo de Caixa & DRE
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Controle entradas de pedidos e saídas com compras de insumos para ver seu lucro líquido real.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Entrada / Despesa</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Receitas / Entradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-700 font-sans block">
            {formatCurrency(totalIncome)}
          </span>
          <span className="text-[11px] text-stone-400">Total acumulado de vendas</span>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Despesas / Saídas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-rose-700 font-sans block">
            {formatCurrency(totalExpense)}
          </span>
          <span className="text-[11px] text-stone-400">Insumos, gás, embalagens</span>
        </div>

        {/* Lucro Líquido Real */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Lucro Líquido Real</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span
            className={`text-2xl font-bold font-sans block ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(netBalance)}
          </span>
          <span className="text-[11px] text-stone-400">O que sobra no bolso</span>
        </div>

        {/* Margem Líquida */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Margem Líquida</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold text-purple-700 font-sans block">
            {profitMargin.toFixed(1)}%
          </span>
          <span className="text-[11px] text-stone-400">Eficiência financeira</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
          <span>EXTRATO DE LANÇAMENTOS ({transactions.length})</span>
        </div>

        <div className="divide-y divide-stone-100">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === 'income'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {t.type === 'income' ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-xs sm:text-sm text-stone-900">
                    {t.description}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    <span className="font-medium text-stone-600">{t.category}</span>
                    <span>•</span>
                    <span>{formatDateTime(t.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-sm sm:text-base font-bold font-sans ${
                    t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Excluir lançamento "${t.description}"?`)) deleteTransaction(t.id);
                  }}
                  className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Lançar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">
                Novo Lançamento Financeiro
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('Vendas de Pedidos');
                  }}
                  className={`py-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                    type === 'income'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <span>Entrada (Receita)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('Insumos & Matéria-Prima');
                  }}
                  className={`py-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 ${
                    type === 'expense'
                      ? 'border-rose-500 bg-rose-50 text-rose-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Saída (Despesa)</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium"
                >
                  {type === 'income' ? (
                    <>
                      <option value="Vendas de Pedidos">Vendas de Pedidos</option>
                      <option value="Eventos & Buffet">Eventos & Buffet</option>
                      <option value="Outras Receitas">Outras Receitas</option>
                    </>
                  ) : (
                    <>
                      <option value="Insumos & Matéria-Prima">Insumos & Matéria-Prima</option>
                      <option value="Embalagens & Caixas">Embalagens & Caixas</option>
                      <option value="Gás, Energia & Água">Gás, Energia & Água</option>
                      <option value="Marketing & Anúncios">Marketing & Anúncios</option>
                      <option value="Equipamentos & Utensílios">Equipamentos & Utensílios</option>
                      <option value="Outras Despesas">Outras Despesas</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Compra de 5 latas de Leite Condensado"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Valor (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 85.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-xs"
                >
                  Salvar Lançamento
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
