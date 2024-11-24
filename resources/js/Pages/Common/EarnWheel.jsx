// components/Wheelin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const prizes = [
  { id: 1, name: '10 Coins', type: 'coins', amount: 10 },
  { id: 2, name: '50 Coins', type: 'coins', amount: 50 },
  { id: 3, name: '100 Coins', type: 'coins', amount: 100 },
  { id: 4, name: '500 Coins', type: 'coins', amount: 500 },
  { id: 5, name: '1000 Coins', type: 'coins', amount: 1000 },
  { id: 6, name: 'Special Item', type: 'item', item: 'Golden Ticket' },
  // Add more prizes as needed
];

const Wheelin = () => {
  const [balance, setBalance] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user balance on component mount
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/user/balance');
      setBalance(response.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Unable to fetch balance.');
    }
  };

  const handleSpin = async () => {
    if (spinning) return;

    if (balance < 10) {
      setError('You need at least 10 coins to spin.');
      return;
    }

    setError('');
    setSpinning(true);
    setPrize(null);

    try {
      // Deduct coins
      await axios.post('/api/user/spend', { amount: 10 });
      setBalance(prev => prev - 10);

      // Simulate spinning wheel
      setTimeout(() => {
        const prizeIndex = Math.floor(Math.random() * prizes.length);
        const wonPrize = prizes[prizeIndex];
        setPrize(wonPrize);

        // Award prize
        axios.post('/api/user/award', { prize: wonPrize });

        // Update balance if prize is coins
        if (wonPrize.type === 'coins') {
          setBalance(prev => prev + wonPrize.amount);
        }

        setSpinning(false);
      }, 3000); // Spin duration in milliseconds
    } catch (err) {
      console.error('Spin failed:', err);
      setError('An error occurred. Please try again.');
      setSpinning(false);
    }
  };

  return (
    <div className="wheelin-container">
      <h1 className="text-3xl font-bold mb-4">Wheel'in 🎡</h1>
      <p className="mb-2">Your Coins: <strong>{balance}</strong></p>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleSpin}
        disabled={spinning || balance < 10}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {spinning ? 'Spinning...' : 'Spin the Wheel (10 Coins)'}
      </button>

      {spinning && (
        <div className="wheel mt-6">
          {/* Implement spinning wheel animation here */}
          <p>The wheel is spinning...</p>
        </div>
      )}

      {prize && !spinning && (
        <div className="prize-result mt-6">
          <h2 className="text-xl font-semibold">Congratulations!</h2>
          <p>You won: <strong>{prize.name}</strong></p>
        </div>
      )}
    </div>
  );
};

export default Wheelin;