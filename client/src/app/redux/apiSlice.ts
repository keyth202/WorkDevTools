import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import  {fetchToken }  from './token';

// Define baseURL
const baseURL = import.meta.env.VITE_PROD_API_URL || "http://localhost:3000/";

// Async function to fetch token (prepareHeaders can't await fetchToken)
let access_token: string | null = null;

const getAccessToken = async () => {
  if (!access_token) {
    access_token = await fetchToken();
  }
  return access_token;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    
    prepareHeaders: (headers) => {
      //const token = await getAccessToken();
      //console.log('Access_token: ', token);
      /*
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }*/
      headers.set('Content-Type', 'application/json');
      if (!headers.has('Accept')) {
        headers.set('Accept', 'application/json');
      }
      //console.log('Headers being set: ', headers);
      return headers;
    },
  }),
  
  endpoints: (builder: any) => ({
    getWss: builder.query({
      query: () => `/api/client/ws/`,
      
    }),
    startWSS:builder.mutation({
        query: (body) => ({
            url: `/api/client/startwss/`,
            method: 'POST',
            body,
        }),
    }),
    findOrg: builder.mutation({
      query: (body) => ({
          url: `/api/genesys/registeredorgs/`,
          method: 'POST',
          body,
      }),
    }),
    /*
    getOrgs: builder.query({
      query: () => ({
          url: `/api/genesys/orgs/`,
          method: 'GET',
          headers: new Headers({
            'Content-Type': 'application/json',
        }),  
      }),
    }),*/
    getOrgs: builder.query({
      query: () => `/api/genesys/orgs/`,
      
    }),
    getUser: builder.query({
      query: () => `/api/admin/user`,
      
    }),
    addConfig: builder.mutation({
      query: (body) => ({
          url: `/api/admin/config/`,
          method: 'POST',
          body,
      }),    
    }),
    findUser:builder.mutation({
        query: (body) => ({
            url: `/api/client/users/`,
            method: 'POST',
            body,
        }),
    }),
    postTranscripts: builder.mutation({
      query: (body) => ({
          url: `/api/transcripts/`,
          method: 'POST',
          body,
      }),
    }),
    postKeyTranscripts: builder.mutation({
      query: (body) => ({
          url: `/api/transcripts/keywords/`,
          method: 'POST',
          body,
      }),
    }),
  }),
    
});

export const { 
    useGetWssQuery,
    useStartWSSMutation,
    useFindOrgMutation,
    useLazyGetOrgsQuery,
    useGetUserQuery,
    useFindUserMutation,
    useAddConfigMutation,
    usePostTranscriptsMutation,
    usePostKeyTranscriptsMutation,
 } = apiSlice;