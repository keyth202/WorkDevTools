
import React from 'react';
import { useRecoilValue } from 'recoil';
import { authState } from '../recoil/authState';
import { Navigate, Outlet } from 'react-router-dom';
import Nav from '@/components/nav/Nav';
import Notification from '@/components/popup/Notification';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
/*
const ProtectedRoute = ({ children }) => {
  const auth = useRecoilValue(authState);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }else{
    console.log(`Auth ${auth}`)
  }

  return children;
};
*/
const ProtectedRoute =() =>{
    const auth = useRecoilValue(authState);
    console.log('Checking auth?')
    if (auth === undefined || auth.isLoading) {
      return <LoadingOverlay />; // or a spinner
    }
 
    return !auth.isAuthenticated  ? <Navigate to="/login" />: <div className="">
      <Nav />
      <Outlet />
      <Notification />
       </div>;
    

}
export default ProtectedRoute;