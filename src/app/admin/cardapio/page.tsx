'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
  Search,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminCardapioPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    deleteCategory,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form de Produto
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isCustomOrder, setIsCustomOrder] = useState(false);
  const [stock, setStock] = useState('10');
  const [highlightBadge, setHighlightBadge] = useState('');

  // Modal de Nova Categoria
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setIsCustomOrder(false);
    setStock('10');
    setHighlightBadge('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategoryId(product.categoryId);
    setDescription(product.description);
    setPrice(product.price.toString());
    setImageUrl(product.imageUrl);
    setIsCustomOrder(product.isCustomOrder);
    setStock((product.stock ?? 10).toString());
    setHighlightBadge(product.highlightBadge || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Preencha nome e preço do doce.');
      return;
    }

    const numericPrice = parseFloat(price.replace(',', '.')) || 0;
    const numericStock = parseInt(stock, 10) || 0;

    const fallbackImage =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80';

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: numericPrice,
        imageUrl: fallbackImage,
        isCustomOrder,
        stock: isCustomOrder ? undefined : numericStock,
        highlightBadge: highlightBadge.trim() || undefined,
      });
    } else {
      addProduct({
        name: name.trim(),
        categoryId: categoryId || categories[0]?.id || 'cat-1',
        description: description.trim(),
        price: numericPrice,
        imageUrl: fallbackImage,
        isAvailable: true,
        isCustomOrder,
        stock: isCustomOrder ? undefined : numericStock,
        highlightBadge: highlightBadge.trim() || undefined,
      });
    }

    setIsProductModalOpen(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setNewCatName('');
    setIsCatModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Cardápio & Produtos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Cadastre, edite e organize os doces pronta entrega e bolos sob encomenda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-500" />
            <span>Nova Categoria</span>
          </button>

          <button
            onClick={openNewProductModal}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Doce / Produto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do doce ou ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <select
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
          className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 font-medium text-stone-700"
        >
          <option value="all">Todas as Categorias ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-500">
          <span>{filteredProducts.length} PRODUTO(S) ENCONTRADO(S)</span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredProducts.map((product) => {
            const cat = categories.find((c) => c.id === product.categoryId);

            return (
              <div
                key={product.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                {/* Image and Basic Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 bg-rose-50"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                        {product.name}
                      </h3>
                      {product.highlightBadge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          {product.highlightBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1 max-w-md mt-0.5">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                      <span className="font-medium text-stone-600">{cat?.name || 'Sem Categoria'}</span>
                      <span>•</span>
                      <span>
                        {product.isCustomOrder ? 'Sob Encomenda' : `Estoque: ${product.stock ?? 0} un.`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-bold text-stone-900 font-sans">
                      {formatCurrency(product.price)}
                    </span>
                    <button
                      onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                      className={`block text-[11px] font-semibold mt-0.5 ${
                        product.isAvailable ? 'text-emerald-600' : 'text-stone-400'
                      }`}
                    >
                      {product.isAvailable ? '● Disponível' : '○ Oculto na Loja'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditProductModal(product)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Produto (Novo / Editar) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {editingProduct ? 'Editar Doce / Produto' : 'Cadastrar Novo Doce'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bolo Vulcão de Ninho com Nutella"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 24.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descrição Atraente</label>
                <textarea
                  rows={2}
                  placeholder="Descreva as camadas, recheios nobres e sabor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL da Imagem / Foto</label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-doce.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Dica: Deixe em branco para usar uma foto gourmet padrão do sistema.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Badge Especial</label>
                  <input
                    type="text"
                    placeholder="Ex: Mais Vendido, Novidade..."
                    value={highlightBadge}
                    onChange={(e) => setHighlightBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {isCustomOrder ? 'Tipo de Produto' : 'Estoque Pronta Entrega'}
                  </label>
                  {isCustomOrder ? (
                    <span className="block py-2 text-amber-700 font-semibold text-xs">
                      Sob Encomenda (Montador)
                    </span>
                  ) : (
                    <input
                      type="number"
                      placeholder="Qtd em estoque"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Checkbox Sob Encomenda */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCustomOrder}
                  onChange={(e) => setIsCustomOrder(e.target.checked)}
                  className="rounded-sm border-rose-300 text-rose-500 focus:ring-rose-400"
                />
                <span className="text-xs text-stone-800 font-medium">
                  Este produto requer encomenda personalizada (abre o montador de massas e recheios)
                </span>
              </label>

              <div className="pt-4 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Doce'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nova Categoria */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="font-serif text-base font-bold text-stone-900">Nova Categoria</h3>
              <button onClick={() => setIsCatModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ovos de Páscoa, Tortas Geladas"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-semibold text-xs"
                >
                  Criar Categoria
                </button>
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Lista de categorias existentes */}
            <div className="pt-3 border-t border-stone-100 space-y-1.5">
              <span className="text-[11px] font-semibold text-stone-400 block">
                CATEGORIAS ATIVAS:
              </span>
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1">
                  <span>{c.name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir categoria "${c.name}"?`)) deleteCategory(c.id);
                    }}
                    className="text-stone-300 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
