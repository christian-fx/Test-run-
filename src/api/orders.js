import { addItem, updateItem, deleteItem, subscribeToCollection, getCollection } from "./db";

const COLLECTION = "orders";

export const addOrder = (data) => addItem(COLLECTION, data);
export const updateOrder = (id, data) => updateItem(COLLECTION, id, data);
export const deleteOrder = (id) => deleteItem(COLLECTION, id);
export const subscribeToOrders = (callback) => subscribeToCollection(COLLECTION, callback, "order_date");
export const getAllOrders = () => getCollection(COLLECTION, "order_date");
