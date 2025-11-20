import axios from 'axios';

//const baseURL = process.env.REACT_APP_BACKEND_API_URL || "http://localhost:5000/api/";
const baseURL = import.meta.env.VITE_BACKEND_API_URL;
const client_id = import.meta.env.VITE_CLIENT_ID;
const client_secret = import.meta.env.VITE_CLIENT_SECRET;

export const fetchToken = async ():Promise<string | null> => {
    const response = await axios.post(`${baseURL}auth/token`, {
      client_id,
      client_secret,
    });
    return response.data.access_token;
  };