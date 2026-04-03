import { supabase } from "./supabase";

export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Refresh for security and redirect
    window.location.href = '/login'; 
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;
    
    // Optionally fetch profile from 'team' table if needed for roles
    const { data: profile } = await supabase
      .from('team')
      .select('*')
      .eq('email', user.email)
      .single();
      
    return { ...user, profile };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const onAuthChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user ?? null);
  });
};
