import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddProductClick: () => void;
  onDeleteProduct: (id: string) => void;
  onTogglePurchased: (id: string) => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const ProductList: React.FC<ProductListProps> = ({ products, onAddProductClick, onDeleteProduct, onTogglePurchased }) => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const marketData = useMemo(() => {
    return products.reduce((acc, product) => {
      const marketName = product.bestMarket?.name || 'Outros';
      if (!acc[marketName]) {
        acc[marketName] = { products: [], totalCost: 0 };
      }
      acc[marketName].products.push(product);
      if (!product.purchased && product.bestMarket) {
        acc[marketName].totalCost += product.bestMarket.totalCost;
      }
      return acc;
    }, {} as Record<string, { products: Product[], totalCost: number }>);
  }, [products]);

  const marketNames = Object.keys(marketData).sort();

  useEffect(() => {
    if (marketNames.length > 0 && (!activeTab || !marketNames.includes(activeTab))) {
      setActiveTab(marketNames[0]);
    } else if (marketNames.length === 0) {
      setActiveTab(null);
    }
  }, [marketNames, activeTab]);


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Meus Produtos</h2>
        <button
          onClick={onAddProductClick}
          className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PlusIcon className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium text-slate-700">Sua lista está vazia!</h3>
          <p className="text-slate-500 mt-2">Clique em "Adicionar Produto" para começar a comparar preços e economizar.</p>
        </div>
      ) : (
        <div>
          <div className="border-b border-slate-200 mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {marketNames.map(marketName => (
                <button
                  key={marketName}
                  onClick={() => setActiveTab(marketName)}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
                    activeTab === marketName
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {marketName}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-bold ${activeTab === marketName ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {formatCurrency(marketData[marketName].totalCost)}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          {activeTab && marketData[activeTab] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData[activeTab].products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDelete={onDeleteProduct}
                  onTogglePurchased={onTogglePurchased}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
