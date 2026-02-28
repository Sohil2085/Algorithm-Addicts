import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://algorithm-addicts.onrender.com' : 'http://localhost:5000');

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const initiateCall = async (dealId) => {
  const res = await axios.post(`${API_URL}/api/call/${dealId}/initiate`, {}, { headers: getHeaders() });
  return res.data;
};

export const endCall = async (dealId) => {
  const res = await axios.patch(`${API_URL}/api/call/${dealId}/end`, {}, { headers: getHeaders() });
  return res.data;
};

export const getCallStatus = async (dealId) => {
  const res = await axios.get(`${API_URL}/api/call/${dealId}/status`, { headers: getHeaders() });
  return res.data;
};

export const getRecordings = async (dealId) => {
  const res = await axios.get(`${API_URL}/api/call/${dealId}/recordings`, { headers: getHeaders() });
  return res.data;
};

// Batch get call statuses for multiple deals
export const getMultipleCallStatuses = async (dealIds) => {
  // Execute all status requests in parallel
  const promises = dealIds.map(id => getCallStatus(id).catch(() => ({ success: false, data: { status: 'UNKNOWN' } })));
  const results = await Promise.all(promises);

  // Return a map of dealId -> status
  const statusMap = {};
  dealIds.forEach((id, index) => {
    statusMap[id] = results[index]?.data?.status || 'UNKNOWN';
  });
  return statusMap;
};
