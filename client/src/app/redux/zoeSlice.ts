import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {loadFromLocalStorageWithExpiry } from '@/helpers/helper';
//import { useRecoilValue } from 'recoil';
//import { userState } from '../recoil/atoms';

const baseURL =  import.meta.env.BASEURL as string||"http://localhost:5000/api/zoe";
//const user = useRecoilValue(userState)
//const token = "someToken";
export const zoeSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: baseURL,
        mode:'cors', 
        prepareHeaders:(headers)=>{
            const token = loadFromLocalStorageWithExpiry('x-auth-token')            
            if(token ){
                headers.set('Authorization', `Bearer ${token}`);
                console.log('Setting auth')
            }
            return headers;
        },
    }),    
    endpoints: (builder) => ({ 
        getUserInfo:builder.query<any,void>({
            query:()=>`/profile/me`,
        }),   
        loginUser: builder.mutation({
           query:(body)=>({
                url:`/auth`,
                method: 'POST',
                body,
           }), 
        }),
        registerUser: builder.mutation({
            query:(body)=>({
                 url:`/auth/register`,
                 method: 'POST',
                 body,
            }), 

         }),
        createProfile:builder.mutation({
            query:(body)=>({
                url:'/profile/editme',
                method:'PATCH',
                body,
            })
        }),
        getStatsByDate: builder.query<any, { startDate: string; endDate: string }>({
            query: ({ startDate, endDate }) =>
              `/stats/range?startDate=${startDate}&endDate=${endDate}`,
        }),
        updatePoints: builder.mutation({
            query:(body)=>({
                url:'/stats/points',
                method:'POST',
                body,
            })
        }),
        getExerciseByRange: builder.query<any, { startDate: string; endDate: string }>({
            query: ({ startDate, endDate }) =>
              `/exercise/me/range?startDate=${startDate}&endDate=${endDate}`,
        }),
    }),
});

export const { 
    useGetUserInfoQuery,
    useLoginUserMutation,
    useRegisterUserMutation,
useCreateProfileMutation,
useLazyGetStatsByDateQuery, 
useUpdatePointsMutation,
useLazyGetExerciseByRangeQuery } = zoeSlice;