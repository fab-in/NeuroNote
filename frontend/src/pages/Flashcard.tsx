import React, { useState } from 'react';
import axios from 'axios';

interface FlashcardData {
  summary: string;
  questions: string;
}

interface Question {
  question: string;
  answer: string;
}

const Flashcard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState<string>('flashcard');
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuestionType(e.target.value);
  };

  const processQuestions = (questionsText: string): Question[] => {
    return questionsText
      .split('\n')
      .filter(q => q.trim())
      .map(q => {
        // Split question and answer if they exist
        const [question, answer] = q.split('Answer:').map(s => s.trim());
        return {
          question: question || q,
          answer: answer || 'Click to reveal answer'
        };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('questionType', questionType);

    try {
      const response = await axios.post('http://localhost:3000/api/process-file', formData);
      
      if (!response.data || !response.data.questions) {
        throw new Error('Invalid response format from server');
      }

      setFlashcardData({
        summary: response.data.summary || '',
        questions: response.data.questions
      });
      
      // The questions are already in the correct format from the backend
      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.details || 
                          err.response?.data?.error || 
                          err.message || 
                          'Error processing file. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev: number) => prev + 1);
      setShowAnswer(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev: number) => prev - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const getCurrentQuestion = (): Question => {
    return questions[currentQuestionIndex] || { question: '', answer: '' };
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Flashcard Generator</h1>
        
        {/* File Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload PDF or PPTX
            </label>
            <input
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={handleQuestionTypeChange}
              className="w-full p-2 border rounded"
            >
              <option value="flashcard">Flashcards</option>
              <option value="1marker">1 Marker</option>
              <option value="2marker">2 Markers</option>
              <option value="3marker">3 Markers</option>
              <option value="5marker">5 Markers</option>
              <option value="truefalse">True/False</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Generate Flashcards'}
          </button>

          {error && (
            <p className="text-red-500 mt-2 text-center">{error}</p>
          )}
        </form>

        {/* Flashcard Display */}
        {flashcardData && questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Summary</h2>
              <p className="text-gray-600">{flashcardData.summary}</p>
            </div>

            <div className="relative min-h-[300px] flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <div
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
                  onClick={toggleAnswer}
                >
                  <div className="text-center">
                    <p className="text-lg font-medium mb-4">
                      {getCurrentQuestion().question}
                    </p>
                    {showAnswer && (
                      <p className="text-gray-600">
                        {getCurrentQuestion().answer}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={previousQuestion}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 disabled:opacity-50"
                disabled={currentQuestionIndex === 0}
              >
                ←
              </button>

              <button
                onClick={nextQuestion}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 disabled:opacity-50"
                disabled={currentQuestionIndex === questions.length - 1}
              >
                →
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;