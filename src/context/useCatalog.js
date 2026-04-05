import { createContext, useContext } from 'react';

export const CatalogContext = createContext({
  categories: [],
  products: [],
  loading: true,
  getBrandsForCategory: () => []
});

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
