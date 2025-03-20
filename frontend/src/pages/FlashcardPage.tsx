import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Question {
  question: string;
  answer: string;
}

interface FlashcardData {
  summary: string;
  questions: Question[];
  questionType: string;
}

export default function FlashcardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);

  useEffect(() => {
    // Get data from location state
    const data = location.state?.flashcardData;
    if (!data) {
      navigate('/');
      return;
    }
    setFlashcardData(data);
  }, [location, navigate]);

  if (!flashcardData) {
    return null;
  }

  const { questions, summary, questionType } = flashcardData;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Summary Section */}
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-3 text-center">Summary</h2>
        <div className="max-h-24 overflow-y-auto bg-gray-800 rounded-lg p-3">
          <p className="text-gray-300 text-sm">{summary}</p>
        </div>
      </div>

      {/* Flashcard Container */}
      <div className="w-full max-w-4xl h-[400px] perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden bg-gray-800 rounded-xl shadow-2xl p-8 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Question {currentQuestionIndex + 1}</h3>
              <p className="text-xl text-gray-300">{currentQuestion.question}</p>
              <p className="text-sm text-gray-400 mt-4">Click to reveal answer</p>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden bg-indigo-600 rounded-xl shadow-2xl p-8 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors rotate-y-180">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Answer</h3>
              <p className="text-xl text-white">{currentQuestion.answer}</p>
              <p className="text-sm text-white/80 mt-4">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center space-x-8 mt-8">
        <button
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <span className="text-gray-300 text-lg">
          {currentQuestionIndex + 1} / {questions.length}
        </span>

        <button
          onClick={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="mt-8 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
} 