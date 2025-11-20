import {configureStore} from "@reduxjs/toolkit";
import {zoeSlice} from "./zoeSlice"

export const store = configureStore({
    reducer:{
        [zoeSlice.reducerPath]:zoeSlice.reducer,
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware().concat(zoeSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;