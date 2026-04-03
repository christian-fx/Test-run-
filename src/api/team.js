import { addItem, updateItem, deleteItem, subscribeToCollection, getCollection } from "./db";

const TABLE = "team";

export const getTeamMember = (id) => getCollection(TABLE).then(data => data.find(m => m.id === id));
export const getAllTeamMembers = () => getCollection(TABLE);
export const addTeamMember = (data) => addItem(TABLE, data);
export const updateTeamMember = (id, data) => updateItem(TABLE, id, data);
export const deleteTeamMember = (id) => deleteItem(TABLE, id);
export const subscribeToTeam = (callback) => subscribeToCollection(TABLE, callback);
