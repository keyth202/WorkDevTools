import React from 'react'
import Header from '@/components/fakebank/Header'
import Hero from '@/components/fakebank/Hero'
import Features from '@/components/fakebank/Features'
import Footer from '@/components/fakebank/Footer'
//import GenesysMessenger from '@/components/Genesys/GenesysMessenger'
import Chat from '@/components/Genesys/Chat'
import { generateUUID } from '@/components/Genesys/helpers'

const wurl = import.meta.env.VITE_GENESYS_WSURL
const depId = import.meta.env.VITE_GENESYS_DEPLOYMENT_ID

const FakeBank = () => {
  return (
    <div>
        <Header />
        <Hero />
        <Features />
        <Footer />
        <Chat 
            websocketUrl={wurl}
            deploymentId={depId}
            token={generateUUID()}
        />
    </div>
  )
}

export default FakeBank