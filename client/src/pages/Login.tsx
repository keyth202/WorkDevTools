import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
//import LoginForm from '@/components/loginForms/LoginForm';
//import RegisterForm from '@/components/loginForms/RegisterForm';
import logo from '@/assets/gryyndlogo3.png'
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import Avatar from '@/components/avatar/Avatar';
import { useRecoilValue } from 'recoil';
import { authState } from '@/app/recoil/authState';


const Login = () => {
  const auth = useRecoilValue(authState)
  const [activeTab, setActiveTab] = useState<boolean>(true);

  const navigate = useNavigate();

  if (auth.isAuthenticated) {
    navigate('/profile');
    return null;
  }
  const changeTab =()=>{
    setActiveTab(!activeTab)

  }
  return (<div className="bg-slate-800 min-h-screen flex flex-col items-center pt-10 px-4">
      
      {/* Logo with animation */}
      <div className="flex items-center justify-center space-x-4">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl sm:text-8xl text-teal-500 font-bold"
        >
          gr
        </motion.div>

        <motion.img
          src={logo}
          alt="logo"
          className="h-[72px] sm:h-[102px]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl sm:text-8xl text-purple-600 font-bold"
        >
          nd
        </motion.div>
      </div>

      {/* Form + Avatar Section */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 mt-10 w-full max-w-5xl">
        
        {/* Form Section */}
        <div className="flex flex-col items-center w-full max-w-sm">
          {activeTab ? <LoginForm /> : <RegisterForm />}

          <div className="flex justify-center w-full mt-4">
            <button
              onClick={changeTab}
              className="w-full py-2 bg-purple-500 rounded-xl transition duration-200 shadow-lg hover:-translate-y-1 hover:shadow-xl hover:bg-teal-500"
            >
              {activeTab ? 'Register' : 'Login'}
            </button>
          </div>
        </div>

        {/* Avatar (static position) 
        <div className="mt-10 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
          <Avatar />
        </div>*/}
      </div>
    </div>
  );

}

export default Login