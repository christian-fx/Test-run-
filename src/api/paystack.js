import { supabase } from './supabase';

/**
 * Paystack API Client — Secure Edition
 * 
 * All calls are proxied through a Supabase Edge Function.
 * The secret key NEVER touches the browser.
 */

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack`;

/**
 * Helper to call the Edge Function with auth
 */
const callEdgeFunction = async (body) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in to process payments.");
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Edge Function request failed.");
  }

  return data;
};

/**
 * Initialize a Paystack transaction
 * The secret key is read server-side in the Edge Function — never exposed to the client.
 */
export const initializeTransaction = async (email, amount, metadata = {}) => {
  try {
    const response = await callEdgeFunction({
      action: "initialize",
      email,
      amount,
      metadata,
      callback_url: `${window.location.origin}/orders/callback`,
    });

    if (!response.status) throw new Error(response.message || "Initialization failed");
    return response.data; // Contains authorization_url and reference
  } catch (error) {
    console.error("Paystack Initialization Error:", error);
    throw error;
  }
};

/**
 * Verify a Paystack transaction by reference
 * The secret key is read server-side in the Edge Function — never exposed to the client.
 */
export const verifyTransaction = async (reference) => {
  try {
    const response = await callEdgeFunction({
      action: "verify",
      reference,
    });

    if (!response.status) throw new Error(response.message || "Verification failed");
    return response.data; // Contains status, amount, metadata, etc.
  } catch (error) {
    console.error("Paystack Verification Error:", error);
    throw error;
  }
};
