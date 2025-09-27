import React, { useState, useCallback } from 'react';
import { Product } from './types';
import ProductList from './components/ProductList';
import AddProductForm from './components/AddProductForm';

type View = 'list' | 'add';

const App: React.FC = () => {
  const [view, setView] = useState<View>('list');
  const [products, setProducts] = useState<Product[]>([]);
  const [knownMarketNames, setKnownMarketNames] = useState<Set<string>>(new Set());

  const handleAddProduct = useCallback((product: Product) => {
    setProducts(prevProducts => [...prevProducts, product]);
    
    const newMarketNames = new Set(knownMarketNames);
    product.markets.forEach(market => {
      if (market.name.trim()) {
        newMarketNames.add(market.name.trim());
      }
    });
    setKnownMarketNames(newMarketNames);
    
    setView('list');
  }, [knownMarketNames]);

  const handleDeleteProduct = useCallback((id: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
  }, []);

  const handleTogglePurchased = useCallback((id: string) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === id ? { ...p, purchased: !p.purchased } : p
      )
    );
  }, []);

  const handleShowAddForm = useCallback(() => {
    setView('add');
  }, []);

  const handleCancelAdd = useCallback(() => {
    setView('list');
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto max-w-4xl px-4 py-5">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            🛒 Lista de Compras Inteligente
          </h1>
          <p className="text-slate-600 mt-1">Compare preços e economize de verdade.</p>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl p-4">
        {view === 'list' && (
          <ProductList
            products={products}
            onAddProductClick={handleShowAddForm}
            onDeleteProduct={handleDeleteProduct}
            onTogglePurchased={handleTogglePurchased}
          />
        )}
        {view === 'add' && (
          <AddProductForm
            onAddProduct={handleAddProduct}
            onCancel={handleCancelAdd}
            knownMarketNames={Array.from(knownMarketNames)}
          />
        )}
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Desenvolvido com React, TypeScript e Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;