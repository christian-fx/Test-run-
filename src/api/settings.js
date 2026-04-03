import { supabase } from "./supabase";

/**
 * Universal fetch for singleton settings tables (ID=1)
 */
export const getSettings = async (table) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq('id', 1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching settings from ${table}:`, error);
    throw error;
  }
};

/**
 * Universal update for singleton settings tables (ID=1)
 */
export const updateSettings = async (table, data) => {
  try {
    // mapped schema to snake_case should be handled by the caller or a mapper
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error updating settings in ${table}:`, error);
    throw error;
  }
};
/**
 * Real-time listener for settings (ID=1)
 */
export const subscribeToSettings = (table, callback) => {
  // Initial fetch
  getSettings(table).then(callback);

  // Subscribe to changes
  const subscription = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table,
        filter: 'id=eq.1' 
    }, (payload) => {
        callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
