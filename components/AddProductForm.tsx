import React, { useState, useEffect } from 'react';
import { Product, MarketOption, Unit, BestMarketInfo } from '../types';

interface AddProductFormProps {
  onAddProduct: (product: Product) => void;
  onCancel: () => void;
  knownMarketNames: string[];
}

const initialMarketState: MarketOption[] = [
    { id: 1, name: '', price: '', quantity: '', unit: Unit.G },
    { id: 2, name: '', price: '', quantity: '', unit: Unit.G },
    { id: 3, name: '', price: '', quantity: '', unit: Unit.G },
];

const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);


const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onCancel, knownMarketNames }) => {
    const [productName, setProductName] = useState('');
    const [desiredQuantity, setDesiredQuantity] = useState('1');
    const [desiredUnit, setDesiredUnit] = useState<Unit>(Unit.KG);
    const [markets, setMarkets] = useState<MarketOption[]>(initialMarketState);
    const [error, setError] = useState<string | null>(null);

    const isMassUnit = (unit: Unit) => unit === Unit.KG || unit === Unit.G;
    const isVolumeUnit = (unit: Unit) => unit === Unit.L || unit === Unit.ML;

    useEffect(() => {
        const desiredIsMass = isMassUnit(desiredUnit);
        const marketsNeedUpdate = markets.some(market => desiredIsMass !== isMassUnit(market.unit));

        if (marketsNeedUpdate) {
            setMarkets(prevMarkets => {
                const newDefaultUnit = desiredIsMass ? Unit.G : Unit.ML;
                return prevMarkets.map(market => ({ ...market, unit: newDefaultUnit }));
            });
        }
    }, [desiredUnit]);

    const handleMarketChange = (id: number, field: keyof MarketOption, value: string | Unit) => {
        setMarkets(prevMarkets =>
            prevMarkets.map(market =>
                market.id === id ? { ...market, [field]: value } : market
            )
        );
    };

    const convertToBaseUnit = (quantity: number, unit: Unit): number => {
        if (unit === Unit.KG || unit === Unit.L) {
            return quantity * 1000;
        }
        return quantity;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validMarkets = markets.filter(m =>
            m.name.trim() && parseFloat(m.price) > 0 && parseFloat(m.quantity) > 0
        );

        if (!productName.trim()) {
            setError('Por favor, insira o nome do produto.');
            return;
        }

        if (validMarkets.length < 1) {
            setError('Adicione pelo menos um mercado com preço e quantidade válidos para comparar.');
            return;
        }

        const desiredUnitTypeCheck = isMassUnit(desiredUnit) ? isMassUnit : isVolumeUnit;
        if(validMarkets.some(m => !desiredUnitTypeCheck(m.unit))) {
            setError('Não é possível comparar unidades de massa (kg/g) com unidades de volume (l/ml). Verifique as unidades selecionadas.');
            return;
        }

        let bestMarketOption: MarketOption | null = null;
        let minPricePerBaseUnit = Infinity;

        validMarkets.forEach(market => {
            const price = parseFloat(market.price.replace(',', '.'));
            const quantity = parseFloat(market.quantity.replace(',', '.'));
            const baseQuantity = convertToBaseUnit(quantity, market.unit);
            const pricePerUnit = price / baseQuantity;

            if (pricePerUnit < minPricePerBaseUnit) {
                minPricePerBaseUnit = pricePerUnit;
                bestMarketOption = market;
            }
        });

        if (!bestMarketOption) {
            setError('Não foi possível calcular o melhor preço. Verifique os valores inseridos.');
            return;
        }

        const finalDesiredQuantity = parseFloat(desiredQuantity.replace(',', '.'));
        if (isNaN(finalDesiredQuantity) || finalDesiredQuantity <= 0) {
            setError('A quantidade desejada deve ser um número maior que zero.');
            return;
        }
        const desiredBaseQuantity = convertToBaseUnit(finalDesiredQuantity, desiredUnit);
        const totalCost = minPricePerBaseUnit * desiredBaseQuantity;

        const bestMarketResult: BestMarketInfo = {
            name: bestMarketOption.name,
            pricePerBaseUnit: minPricePerBaseUnit,
            totalCost: totalCost,
            baseUnit: isMassUnit(desiredUnit) ? 'g' : 'ml',
        };

        const newProduct: Product = {
            id: Date.now().toString(),
            name: productName.trim(),
            desiredQuantity: finalDesiredQuantity,
            desiredUnit,
            markets: validMarkets,
            bestMarket: bestMarketResult,
            purchased: false,
        };

        onAddProduct(newProduct);
    };

    const unitOptions = {
      mass: [
        { value: Unit.G, label: 'g' },
        { value: Unit.KG, label: 'kg' },
      ],
      volume: [
        { value: Unit.ML, label: 'ml' },
        { value: Unit.L, label: 'l' },
      ],
    };
    const currentUnitType = isMassUnit(desiredUnit) ? 'mass' : 'volume';

    const inputClasses = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 bg-slate-50";
    const selectClasses = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-slate-50";


    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative">
            <button onClick={onCancel} className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 transition-colors">
                 <ArrowLeftIcon className="w-7 h-7" />
            </button>
            <h2 className="text-2xl font-bold text-center mb-6">Adicionar Novo Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <datalist id="market-names-list">
                    {knownMarketNames.map(name => <option key={name} value={name} />)}
                </datalist>

                {/* Product Info */}
                <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-slate-700">Informações do Produto</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-3">
                            <label htmlFor="productName" className="block text-sm font-medium text-slate-600 mb-1">Nome do Produto</label>
                            <input type="text" id="productName" value={productName} onChange={e => setProductName(e.target.value)} className={inputClasses} placeholder="Ex: Arroz Integral" />
                        </div>
                         <div className="sm:col-span-2">
                            <label htmlFor="desiredQuantity" className="block text-sm font-medium text-slate-600 mb-1">Quantidade que Desejo Comprar</label>
                            <input type="text" inputMode="decimal" id="desiredQuantity" value={desiredQuantity} onChange={e => setDesiredQuantity(e.target.value)} className={inputClasses} placeholder="Ex: 2.5" />
                        </div>
                        <div>
                             <label htmlFor="desiredUnit" className="block text-sm font-medium text-slate-600 mb-1">Unidade</label>
                            <select id="desiredUnit" value={desiredUnit} onChange={e => setDesiredUnit(e.target.value as Unit)} className={selectClasses}>
                                <optgroup label="Massa">
                                    <option value={Unit.KG}>kg</option>
                                    <option value={Unit.G}>g</option>
                                </optgroup>
                                <optgroup label="Volume">
                                    <option value={Unit.L}>l</option>
                                    <option value={Unit.ML}>ml</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Markets */}
                <div className="space-y-4">
                  {markets.map((market, index) => (
                      <div key={market.id} className="p-4 border border-slate-200 rounded-lg">
                          <h3 className="text-lg font-semibold mb-3 text-indigo-600">{market.name.trim() || `Opção de Mercado ${index + 1}`}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                              <div className="sm:col-span-2">
                                  <label htmlFor={`marketName${market.id}`} className="block text-sm font-medium text-slate-600 mb-1">Nome do Mercado</label>
                                  <input 
                                    type="text" 
                                    id={`marketName${market.id}`} 
                                    value={market.name} 
                                    onChange={e => handleMarketChange(market.id, 'name', e.target.value)} 
                                    className={inputClasses} 
                                    list="market-names-list"
                                    placeholder="Digite ou selecione"
                                  />
                              </div>
                              <div>
                                  <label htmlFor={`price${market.id}`} className="block text-sm font-medium text-slate-600 mb-1">Preço (R$)</label>
                                  <input type="text" inputMode="decimal" id={`price${market.id}`} value={market.price} onChange={e => handleMarketChange(market.id, 'price', e.target.value)} className={inputClasses} placeholder="17,99" />
                              </div>
                              <div>
                                  <label htmlFor={`quantity${market.id}`} className="block text-sm font-medium text-slate-600 mb-1">Quantidade</label>
                                  <input type="text" inputMode="decimal" id={`quantity${market.id}`} value={market.quantity} onChange={e => handleMarketChange(market.id, 'quantity', e.target.value)} className={inputClasses} placeholder="700" />
                              </div>
                              <div>
                                <select id={`unit${market.id}`} value={market.unit} onChange={e => handleMarketChange(market.id, 'unit', e.target.value as Unit)} className={selectClasses}>
                                  {unitOptions[currentUnitType].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                              </div>
                          </div>
                      </div>
                  ))}
                </div>

                {error && <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="py-2 px-6 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button type="submit" className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Calcular e Adicionar</button>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;