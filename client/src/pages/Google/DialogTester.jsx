import React from 'react'
import Header from '@/components/fakebank/Header'
import Hero from '@/components/fakebank/Hero'
import Features from '@/components/fakebank/Features'
import Footer from '@/components/fakebank/Footer'
import ChatWidget from '@/components/widgets/ChatWidget'
import DialogflowMessengerConvTest from '@/components/Google/DialogFlowMessengerConvTest'
import Nav from '@/components/Nav'

const DialogTester = () => {
  return (
    <div className="w-full">
      {/*<Nav />*/}
      <Header />
      <Hero />
      <Features />
      <Footer />
      <DialogflowMessengerConvTest />
    </div>
  )
}

export default DialogTester