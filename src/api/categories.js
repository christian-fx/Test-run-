import { addItem, updateItem, deleteItem, subscribeToCollection, getCollection } from "./db";

const TABLE = "categories";

export const addCategory = (data) => addItem(TABLE, data);
export const updateCategory = (id, data) => updateItem(TABLE, id, data);
export const deleteCategory = (id) => deleteItem(TABLE, id);
export const subscribeToCategories = (callback) => subscribeToCollection(TABLE, callback);
export const getAllCategories = () => getCollection(TABLE);
