import { addItem, updateItem, deleteItem, subscribeToCollection } from "./db";

/**
 * --- Shipping Zones ---
 */
const ZONES_TABLE = "shipping_zones";

const mapZoneToDB = (data) => {
  const mapped = { ...data };
  if (data.timeEstimate !== undefined) mapped.time_estimate = data.timeEstimate;
  delete mapped.timeEstimate;
  return mapped;
};

const mapZoneFromDB = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapZoneFromDB);
  return {
    ...data,
    timeEstimate: data.time_estimate,
  };
};

export const subscribeToZones = (callback) => {
  return subscribeToCollection(ZONES_TABLE, (data) => callback(mapZoneFromDB(data)), 'created_at');
};

export const upsertZone = async (zoneData) => {
  const { id, ...data } = mapZoneToDB(zoneData);
  if (id) {
    return await updateItem(ZONES_TABLE, id, { ...data, updated_at: new Date().toISOString() });
  } else {
    return await addItem(ZONES_TABLE, { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
};

export const deleteZone = async (id) => {
  return await deleteItem(ZONES_TABLE, id);
};

export const toggleZoneStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
  return await updateItem(ZONES_TABLE, id, { status: newStatus, updated_at: new Date().toISOString() });
};


/**
 * --- Logistics Partners ---
 */
const PARTNERS_TABLE = "logistics_partners";

const mapPartnerFromDB = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(mapPartnerFromDB);
  return {
    ...data,
    iconType: data.icon_type,
  };
};

export const subscribeToPartners = (callback) => {
  return subscribeToCollection(PARTNERS_TABLE, (data) => callback(mapPartnerFromDB(data)), 'name');
};

export const updatePartnerConfig = async (id, configData) => {
  return await updateItem(PARTNERS_TABLE, id, {
    config: configData,
    status: 'Integrated', // Automatically move to integrated once config is saved
    updated_at: new Date().toISOString()
  });
};

export const togglePartnerStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Integrated' ? 'Setup Pending' : 'Integrated';
  return await updateItem(PARTNERS_TABLE, id, { status: newStatus, updated_at: new Date().toISOString() });
};
