import { addItem, updateItem, subscribeToCollection, getCollection } from "./db";

const LOGS_TABLE = "stock_logs";
const PRODUCTS_TABLE = "products";

/**
 * Update a product's stock and record it in the logs
 * @param {string} productId 
 * @param {number} currentStock 
 * @param {number} addedQuantity 
 * @param {string} action - 'Restock', 'Sale', 'Adjustment'
 * @param {string} notes - Optional context/reason
 */
export const restockProduct = async (productId, currentStock, addedQuantity, action = 'Restock', notes = '') => {
  try {
    const newStock = currentStock + addedQuantity;
    
    // 1. Update the product stock
    const updatedProduct = await updateItem(PRODUCTS_TABLE, productId, { stock: newStock });
    
    // 2. Create the log entry
    await addItem(LOGS_TABLE, {
      product_id: productId,
      action: action,
      quantity_change: addedQuantity,
      previous_stock: currentStock,
      new_stock: newStock,
      notes: notes
    });

    return updatedProduct;
  } catch (error) {
    console.error("Error restocking product:", error);
    throw error;
  }
};

/**
 * Get recent stock adjustment history
 */
export const getRecentLogs = () => getCollection(LOGS_TABLE);

/**
 * Real-time listener for stock logs
 */
export const subscribeToStockLogs = (callback) => 
  subscribeToCollection(LOGS_TABLE, callback);
