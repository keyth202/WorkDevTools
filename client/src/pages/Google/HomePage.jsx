import React, {useState} from 'react'
import Header from '@/components/fakebank/Header'
import Hero from '@/components/fakebank/Hero'
import Features from '@/components/fakebank/Features'
import Footer from '@/components/fakebank/Footer'
import ChatWidget from '@/components/widgets/ChatWidget'
import DialogflowMessenger from '@/components/Google/DialogFlowMessenger'
import DialogflowMessengerConvTest from '@/components/Google/DialogFlowMessengerConvTest'
import Nav from '@/components/Nav'

const HomePage = () => {
  const [chatType, setChatType] = useState("default");
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <div className="w-full">
      {/*<Nav />*/}
      <Header />
      <Hero />
      <Features />
      <Footer />
      <ChatWidget />
      {<DialogflowMessengerConvTest />}
    </div>
  )
}

export default HomePage