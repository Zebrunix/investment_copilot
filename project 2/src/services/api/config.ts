export const API_CONFIG = {
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY
  },
  MARKETAUX: {
    BASE_URL: 'https://api.marketaux.com/v1',
    API_KEY: import.meta.env.VITE_MARKETAUX_API_KEY
  }
} as const;