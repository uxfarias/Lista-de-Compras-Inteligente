import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onTogglePurchased: (id: string) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const CircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onTogglePurchased }) => {
  const { name, bestMarket, purchased } = product;

  const cardClasses = `bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between transition-all duration-300 ${ purchased ? 'opacity-60' : 'hover:scale-105' }`;

  return (
    <div className={cardClasses}>
      <div className="p-6">
        <div className="flex justify-between items-start gap-2">
            <h3 className={`text-xl font-bold text-slate-900 mb-2 ${purchased ? 'line-through' : ''}`}>{name}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => onTogglePurchased(product.id)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                    aria-label={purchased ? `Marcar ${name} como não comprado` : `Marcar ${name} como comprado`}
                >
                    {purchased ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <CircleIcon className="w-6 h-6" />}
                </button>
                <button
                    onClick={() => onDelete(product.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    aria-label={`Excluir ${name}`}
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>

        {bestMarket ? (
          <div className="space-y-4 mt-2">
            <div>
                <p className="text-sm text-slate-500">Melhor preço no:</p>
                <p className="text-lg font-semibold text-indigo-600">{bestMarket.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Preço por unidade:</p>
              <p className="font-semibold text-slate-700">
                {formatCurrency(bestMarket.pricePerBaseUnit * (bestMarket.baseUnit === 'g' ? 1000 : 1))} / {bestMarket.baseUnit === 'g' ? 'kg' : 'l'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 mt-4">Não foi possível determinar o melhor preço.</p>
        )}
      </div>

      {bestMarket && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">Custo Total Estimado:</p>
          <p className="text-2xl font-extrabold text-slate-800">
            {formatCurrency(bestMarket.totalCost)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
