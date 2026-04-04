import { supabase } from "./supabase";

/**
 * Fetch recent notifications for the logged-in user
 */
export const getNotifications = async (limit = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Mark ALL notifications as read
 */
export const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('status', 'unread');
  
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error marking all as read:", error);
      return false;
    }
  };

/**
 * Create a new notification
 */
export const createNotification = async (type, title, message) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          type,
          title,
          message,
          status: 'unread',
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Real-time listener for notifications
 */
import { subscribeToCollection } from './db';
export const subscribeToNotifications = (callback) => subscribeToCollection('notifications', callback, 'created_at');
