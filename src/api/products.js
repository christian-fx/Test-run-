import { addItem, updateItem, deleteItem, subscribeToCollection, getCollection } from "./db";

const TABLE = "products";

/**
 * Map frontend camelCase fields to DB snake_case
 * Price is now numeric — no currency symbols in the DB
 */
const mapToDB = (data) => {
  const mapped = { ...data };

  // camelCase → snake_case
  if (data.discountPrice !== undefined) mapped.discount_price = data.discountPrice;
  if (data.isFeatured !== undefined) mapped.is_featured = data.isFeatured;
  if (data.variantOption1Label !== undefined) mapped.variant_option1_label = data.variantOption1Label;
  if (data.variantOption2Label !== undefined) mapped.variant_option2_label = data.variantOption2Label;
  
  // Ensure price is stored as a raw number (strip currency/commas if present)
  if (mapped.price !== undefined) {
    mapped.price = typeof mapped.price === 'string' 
      ? parseFloat(mapped.price.replace(/[^0-9.-]+/g, "")) || 0 
      : Number(mapped.price) || 0;
  }
  if (mapped.discount_price !== undefined && mapped.discount_price !== null) {
    mapped.discount_price = typeof mapped.discount_price === 'string'
      ? parseFloat(mapped.discount_price.replace(/[^0-9.-]+/g, "")) || null
      : Number(mapped.discount_price) || null;
  }

  // Clean up camelCase versions
  delete mapped.discountPrice;
  delete mapped.isFeatured;
  delete mapped.variantOption1Label;
  delete mapped.variantOption2Label;
  
  return mapped;
};

/**
 * Map DB snake_case back to frontend camelCase
 * Price comes back as a number — format for display at the component level
 */
const mapFromDB = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapFromDB);
  
  return {
    ...data,
    discountPrice: data.discount_price,
    isFeatured: data.is_featured,
    variantOption1Label: data.variant_option1_label,
    variantOption2Label: data.variant_option2_label,
  };
};

export const addProduct = (data) => addItem(TABLE, mapToDB(data));
export const updateProduct = (id, data) => updateItem(TABLE, id, mapToDB(data));
export const deleteProduct = (id) => deleteItem(TABLE, id);
export const subscribeToProducts = (callback) => 
  subscribeToCollection(TABLE, (data) => callback(mapFromDB(data)));
export const getAllProducts = () => getCollection(TABLE).then(mapFromDB);
