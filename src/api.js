import { storage } from './utils/storage';

// In this serverless version, we don't have a backend.
// We use localStorage to store everything.
// Initial data is loaded from bundled JSON files if localStorage is empty.

const DEFAULT_API_BASE = 'JSON-MODE';

export const getApiBase = () => DEFAULT_API_BASE;
export const setApiBase = () => {};
export const getUrl = (path) => path;

export default DEFAULT_API_BASE;
