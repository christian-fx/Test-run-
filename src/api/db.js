import { supabase } from "./supabase";

/**
 * Generic function to add a document to a table
 */
export const addItem = async (table, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error adding item to ${table}:`, error);
    throw error;
  }
};

/**
 * Generic function to update a document
 */
export const updateItem = async (table, id, data) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete a document
 */
export const deleteItem = async (table, id) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error);
    throw error;
  }
};

/**
 * Real-time listener for a table
 */
export const subscribeToCollection = (table, callback, orderField = "created_at") => {
  // Initial fetch
  getCollection(table, orderField).then(callback);

  // Subscribe to changes with a unique channel name per instance
  const channelName = `${table}_${Math.random().toString(36).substring(7)}`;
  const subscription = supabase
    .channel(channelName)
    .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table // Ensures we match exactly the table name
    }, (payload) => {
      // Re-fetch everything on any change (simplest for small admin collections)
      console.log(`[Realtime Update] Table: ${table}`, payload);
      getCollection(table, orderField).then(callback);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

/**
 * One-time fetch for a table
 */
export const getCollection = async (table, orderField = "created_at") => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderField, { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching table ${table}:`, error);
    throw error;
  }
};
