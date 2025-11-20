import axios from "axios";
import store from "../store/store";
import { SEARCH_GROUPS } from "../actions/types";

//create instance of axios"http://localhost:5000/api"
const api = axios.create({
  baseURL: import.meta.env.REACT_APP_BACKEND_API_URL || "https://ethical-typically-corgi.ngrok-free.app/",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
    (res)=> res,
    /*
    {
        const token = store.getState().auth.token;
        if(token){
            res.headers.Authorization = `Bearer ${token}`;
        }
        return res;
    }
    */
   (err)=>{
    if(err.response.status === 401){
        console.log("Unauthorized");
        //store.dispatch(logout());
    }
    return Promise.reject(err);
   }
);

export default api;