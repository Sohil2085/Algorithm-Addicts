import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Initiate a call session for a deal.
 * Returns { sessionId, dealId, status, roomToken, socketRoom }
 */
export const initiateCall = async (dealId) => {
  const response = await api.post(`/call/${dealId}/initiate`);
  return response.data;
};

/**
 * End an in-progress call.
 */
export const endCall = async (dealId) => {
  const response = await api.patch(`/call/${dealId}/end`);
  return response.data;
};

/**
 * Get current call session status for a deal.
 */
export const getCallStatus = async (dealId) => {
  const response = await api.get(`/call/${dealId}/status`);
  return response.data;
};
