import axios from 'axios';
import { API_URL } from './config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic API request
export async function apiRequest(endpoint, method = 'GET', data = null) {
  const response = await api.request({
    url: endpoint,
    method,
    data,
  });
  return response.data;
}

// Send OTP to email
export async function sendOTP(email, isNewUser = false) {
  const response = await api.post('/auth/send-otp', { email, isNewUser });
  return response.data;
}

// Verify OTP and login/register
export async function verifyOTP(email, otp, firstName = null, lastName = null, isNewUser = false) {
  const response = await api.post('/auth/verify-otp', {
    email,
    otp,
    firstName,
    lastName,
    isNewUser,
  });
  return response.data;
}

// Get current user profile
export async function fetchUserProfile(token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/auth/me', { headers });
  return response.data;
}

// Get user's skills
export async function fetchUserSkills(token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get('/user-skills/skills', { headers });
  return response.data;
}

// Find mentor matches based on skills
export async function findMentorMatches(skillPreferences, token = null) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.post('/skill-matching/match-mentors', 
    { skill_preferences: skillPreferences },
    { headers }
  );
  return response.data;
}

// Get allowed email domains
export async function getAllowedDomains() {
  const response = await api.get('/auth/allowed-domains');
  return response.data;
}

export default api;
