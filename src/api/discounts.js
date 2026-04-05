import { subscribeToCollection, addItem, updateItem, deleteItem } from './db';

/**
 * Real-time subscription for discounts
 */
export const subscribeToDiscounts = (onUpdate) => {
  return subscribeToCollection('discounts', onUpdate, 'created_at');
};

/**
 * Add or update a discount
 */
export const upsertDiscount = async (discountData) => {
  const { id, ...data } = discountData;
  
  if (id) {
    return await updateItem('discounts', id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  } else {
    return await addItem('discounts', {
      ...data,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
};

/**
 * Delete a discount
 */
export const deleteDiscount = async (id) => {
  return await deleteItem('discounts', id);
};

/**
 * Toggle active status
 */
export const toggleDiscountStatus = async (id, currentStatus) => {
  // If Active, move to Expired. Otherwise, move to Active.
  const newStatus = currentStatus === 'Active' ? 'Expired' : 'Active';
  return await updateItem('discounts', id, { 
    status: newStatus,
    updated_at: new Date().toISOString()
  });
};
