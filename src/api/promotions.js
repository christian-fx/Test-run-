import { addItem, updateItem, deleteItem, subscribeToCollection } from "./db";

const TABLE = "promotions";

/**
 * Map frontend camelCase to DB snake_case for promotions
 */
const mapToDB = (data) => {
  const mapped = { ...data };

  // Map fields (ensure they exist in database schema)
  if (data.imageUrl !== undefined) mapped.image_url = data.imageUrl;
  if (data.linkUrl !== undefined) mapped.link_url = data.linkUrl;
  if (data.startDate !== undefined) mapped.start_date = data.startDate;
  if (data.endDate !== undefined) mapped.end_date = data.endDate;

  // Clean up
  delete mapped.imageUrl;
  delete mapped.linkUrl;
  delete mapped.startDate;
  delete mapped.endDate;

  return mapped;
};

/**
 * Map DB snake_case to frontend camelCase
 */
const mapFromDB = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapFromDB);

  return {
    ...data,
    imageUrl: data.image_url,
    linkUrl: data.link_url,
    startDate: data.start_date,
    endDate: data.end_date,
  };
};

/**
 * Subscribe to promotional campaigns in real-time
 */
export const subscribeToPromotions = (callback) => {
  return subscribeToCollection(TABLE, (data) => callback(mapFromDB(data)), 'created_at');
};

/**
 * Add or Update a promotion document
 */
export const upsertPromotion = async (promotionData) => {
  const { id, ...data } = mapToDB(promotionData);
  
  if (id) {
    return await updateItem(TABLE, id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  } else {
    return await addItem(TABLE, {
      ...data,
      impressions: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
};

/**
 * Permanently remove a promotion
 */
export const deletePromotion = async (id) => {
  return await deleteItem(TABLE, id);
};

/**
 * Quick-toggle status (Running/Paused)
 */
export const togglePromotionStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Running' ? 'Paused' : 'Running';
  return await updateItem(TABLE, id, {
    status: newStatus,
    updated_at: new Date().toISOString()
  });
};
