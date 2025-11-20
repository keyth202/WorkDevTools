import React, {useState, useEffect} from 'react'

const BankComponent = () => {
  const [money, setMoney] = useState(30000);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Deposit', amount: 200 },
    { id: 2, type: 'Withdraw', amount: 100 },
    { id: 3, type: 'Deposit', amount: 50 },
  ]);
  const addMoney = (amount) => {
    setMoney(prevMoney => prevMoney + amount);
  }
  const removeMoney = (amount) => {
    setMoney(prevMoney => prevMoney - amount);
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6" >
    {/* Navbar */}
    <nav className="w-full bg-blue-600 text-white p-4 shadow-md flex justify-center text-xl font-bold">
      Monopoly Money Bank
    </nav>
    <div className="grid grid-cols-2 gap-4 w-full">
    {/* Bank Content */}
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-10" id="bank">
      <h2 className="text-2xl font-semibold text-center">Your Balance</h2>
      <p className="text-4xl text-center text-green-600 font-bold my-4">${money}</p>
      
      <div className="flex justify-between mt-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg w-1/2 mr-2 hover:bg-green-600" onClick={() => addMoney(100)}>
          Deposit
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg w-1/2 ml-2 hover:bg-red-600" onClick={() => removeMoney(100)}>
          Withdraw
        </button>
      </div>
    </div>
    
    {/* Transaction History */}
    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-6 test">
      <h2 className="text-xl font-semibold">Transaction History</h2>
      <ul className="mt-4 space-y-2 text-gray-700">
        <li className="border-b pb-2">Received $200 for passing GO</li>
        <li className="border-b pb-2">Paid $100 in rent</li>
        <li className="border-b pb-2">Collected $50 from Chance card</li>
      </ul>
    </div>
    </div>
  </div>
  )
}

export default BankComponent