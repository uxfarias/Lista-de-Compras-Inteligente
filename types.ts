export enum Unit {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
}

export interface MarketOption {
  id: number;
  name: string;
  price: string;
  quantity: string;
  unit: Unit;
}

export interface BestMarketInfo {
  name: string;
  pricePerBaseUnit: number;
  totalCost: number;
  baseUnit: 'g' | 'ml';
}

export interface Product {
  id: string;
  name: string;
  desiredQuantity: number;
  desiredUnit: Unit;
  markets: MarketOption[];
  bestMarket?: BestMarketInfo;
  purchased?: boolean;
}
