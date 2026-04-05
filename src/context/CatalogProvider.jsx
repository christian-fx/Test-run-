import React, { useState, useEffect } from 'react';
import { subscribeToCategories } from '../api/categories';
import { subscribeToProducts } from '../api/products';
import { CatalogContext } from './useCatalog';

export const CatalogProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Single source of truth for Categories
    const unsubscribeCategories = subscribeToCategories((data) => {
      if (isMounted) {
        setCategories(data);
        setCategoriesLoaded(true);
      }
    });

    // 2. Single source of truth for Products
    const unsubscribeProducts = subscribeToProducts((data) => {
      if (isMounted) {
        setProducts(data);
        setProductsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeCategories();
      unsubscribeProducts();
    };
  }, []);

  const value = {
    categories,
    products,
    loading: !categoriesLoaded || !productsLoaded,
    // Helper to get brands for a specific hierarchical selection
    getBrandsForCategory: (fullCategoryName) => {
      if (!fullCategoryName) return [];
      const [catName, subName] = fullCategoryName.split(' > ').map(s => s.trim());
      const cat = categories.find(c => c.name === catName);
      if (!cat) return [];
      
      if (subName) {
        return cat.subcategories?.find(s => s.name === subName)?.brands || [];
      }
      return (cat.subcategories || []).flatMap(s => s.brands || []);
    }
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
};
