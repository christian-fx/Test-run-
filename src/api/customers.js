import { addItem, updateItem, deleteItem, subscribeToCollection, getCollection } from "./db";

const TABLE = "customers";

export const addCustomer = (data) => addItem(TABLE, data);
export const updateCustomer = (id, data) => updateItem(TABLE, id, data);
export const deleteCustomer = (id) => deleteItem(TABLE, id);
export const subscribeToCustomers = (callback) => subscribeToCollection(TABLE, callback, "created_at");
export const getAllCustomers = () => getCollection(TABLE, "created_at");
