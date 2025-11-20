import { useEffect } from 'react'
import AppRouter from './app/routes/Router'
import { buildLog } from './helpers/helper'
//import { initializeApp } from "firebase/app";

function App() {

  useEffect(()=>{
    buildLog("10-2025");
    /*
    const firebaseConfig = {
      apiKey: "AIzaSyCh3uFFv5GcObSSEL6x8QukJg3GZsffS8E",
      authDomain: "parasolmega.firebaseapp.com",
      projectId: "parasolmega",
      storageBucket: "parasolmega.firebasestorage.app",
      messagingSenderId: "317584469189",
      appId: "1:317584469189:web:3dfa1f3cd3e5f716a554ac"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    */
  },[]);

  return (
    <>
      <AppRouter />
    </>
  )
}

export default App
