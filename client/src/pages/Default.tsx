import React from 'react'
import { Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
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
  //const auth = useRecoilValue(authState)
  //Insert routing to login and logic 
  return (<div className='bg-secondary text-primary font-sans'>
      <ResponsiveSidebarLayout title="Dashboard" nav={nav} />
        <Outlet />

    </div>
  
  )
}

export default Default