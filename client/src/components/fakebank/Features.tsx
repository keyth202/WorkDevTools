import React from 'react'
import FeatureCard from './FeatureCard'

const Features = () => {
  return (
     <section className="py-20">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Features Built for You
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          icon="fas fa-shield-alt"
          title="Top-Tier Security"
          description="Your money and data are protected with the latest encryption and fraud prevention technology."
        />
        <FeatureCard
          icon="fas fa-mobile-alt"
          title="Mobile Banking"
          description="Manage your finances anytime, anywhere with our intuitive and powerful mobile app."
        />
        <FeatureCard
          icon="fas fa-piggy-bank"
          title="Smart Savings Tools"
          description="Set savings goals and automate transfers to watch your money grow effortlessly."
        />
      </div>
    </div>
  </section>
  )
}

export default Features