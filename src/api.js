const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getApiBase = () => {
  return localStorage.getItem('hub_api_base_url') || DEFAULT_API_BASE;
};

export const setApiBase = (url) => {
  if (url) {
    localStorage.setItem('hub_api_base_url', url);
  } else {
    localStorage.removeItem('hub_api_base_url');
  }
};

export const getUrl = (path) => {
  if (path.startsWith('http')) return path;

  const base = getApiBase();

  // If base is a full URL, handle it
  if (base.startsWith('http')) {
    if (path.startsWith('/api')) {
      return base + path.substring(4);
    }
    return base + path;
  }

  // Standard relative handling
  if (path.startsWith('/api')) {
    return path.replace('/api', base);
  }
  return path;
};

const API_BASE = getApiBase();
export default API_BASE;
