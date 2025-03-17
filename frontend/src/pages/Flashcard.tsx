import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Flashcard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Flashcard Review</h1>
          <p className="text-gray-400">Question 1 of 5</p>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-8">
          <motion.div
            className="relative w-full aspect-[4/3] cursor-pointer"
            onClick={handleFlip}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className={`absolute w-full h-full bg-gray-800 rounded-xl shadow-lg p-8 backface-hidden
                ${isFlipped ? 'hidden' : ''}`}
            >
              <div className="absolute top-4 right-4 text-sm text-gray-400">
                Tap to reveal answer
              </div>
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  What is the capital of France?
                </h2>
                <p className="text-sm text-gray-400">Question Type: 1-marker</p>
              </div>
            </div>

            {/* Back */}
            <div
              className={`absolute w-full h-full bg-indigo-900 rounded-xl shadow-lg p-8 backface-hidden
                ${!isFlipped ? 'hidden' : ''}`}
              style={{ transform: 'rotateY(180deg)' }}
            >
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-white mb-4">Answer:</h3>
                <p className="text-lg text-gray-200">Paris</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Answer Input */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-300 mb-2">
            Your Answer
          </label>
          <textarea
            id="answer"
            rows={3}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Type your answer here..."
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700">
            Previous
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}