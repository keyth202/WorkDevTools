import React, {useEffect, useState} from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { authState } from '@/app/recoil/authState';
import ResponsiveSidebarLayout, {NavItem} from '@/components/Nav/ResonsiveSidebarLayout';
import { Menu, X, Home, Folder, Settings, HelpCircle, PiggyBank,FileText } from "lucide-react";


const nav: NavItem[] = [
 { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
{ label: "MultiFileUploader", href: "/upload", icon: <Folder className="h-4 w-4" /> },
{ label: "FolderCompare", href: "/folder-compare", icon: <Folder className="h-4 w-4" /> },
{ label: "TTS", href: "/tts", icon: <HelpCircle className="h-4 w-4" /> },
{ label: "Bank", href: "/bank", icon: <PiggyBank className="h-4 w-4" /> },
{ label: "Data Procesor", href: "/data", icon: <FileText className="h-4 w-4" /> },
{ label: "Settings", href: "/settings", icon: <Settings className="h-4 w-4" /> },
 ];


const Default = () => {
  const [token, setToken] = useState<string | null>(null);
  const [auth,setAuth] = useRecoilState(authState)
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (accessToken) {
      setToken(accessToken);
      setAuth((auth)=>({
        ...auth,
        isAuthenticated:true,
        token:accessToken
      }))
      navigate("/data");

    }
  }, []);
  return (<div className='bg-secondary text-primary font-sans'>
      <ResponsiveSidebarLayout title="Dashboard" nav={nav} />
        <Outlet />

    </div>
  
  )
}

export default Default