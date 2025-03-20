import React, { useState } from 'react';
import { Upload, Brain, History, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface FlashcardData {
  summary: string;
  questions: string;
}

interface Question {
  question: string;
  answer: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState('one_word');
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
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

  const handleGenerate = async () => {
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
      setFlashcardData(response.data);
      const processedQuestions = processQuestions(response.data.questions);
      setQuestions(processedQuestions);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.details || err.response?.data?.error || 'Error processing file. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
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
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Brain className="h-8 w-8 text-indigo-400" />
          <span className="text-xl font-bold text-white">NeuroNote</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <History className="h-5 w-5" />
            <span>History</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Generate Flasards</h1>
        
        <div className="max-w-3xl mx-auto">
          {/* File Upload Box */}
          <div className="mb-8">
            <label
              htmlFor="file-upload"
              className="block w-full p-12 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-800"
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-300">
                <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
                <br />
                PDF or PPTX files (max 10MB)
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.pptx"
                onChange={handleFileUpload}
              />
            </label>
            {file && (
              <p className="text-gray-300 text-sm mt-2 text-center">
                Selected file: {file.name}
              </p>
            )}
          </div>

          {/* Question Configuration */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="one_word">One Word</option>
              <option value="true_false">True/False</option>
              <option value="3_mark">3 Mark</option>
              <option value="5_mark">5 Mark</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:bg-gray-500"
          >
            {loading ? 'Processing...' : 'Generate Flashcards'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Flashcard Display */}
          {flashcardData && questions.length > 0 && (
            <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Summary</h2>
                <p className="text-gray-300">{flashcardData.summary}</p>
              </div>

              <div className="relative min-h-[300px] flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div
                    className="bg-gray-700 border-2 border-gray-600 rounded-lg p-6 cursor-pointer transform transition-transform hover:scale-105"
                    onClick={toggleAnswer}
                  >
                    <div className="text-center">
                      <p className="text-lg font-medium text-white mb-4">
                        {getCurrentQuestion().question}
                      </p>
                      {showAnswer && (
                        <p className="text-gray-300">
                          {getCurrentQuestion().answer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={previousQuestion}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600 disabled:opacity-50 text-white"
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={nextQuestion}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 p-2 rounded-full hover:bg-gray-600 disabled:opacity-50 text-white"
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-gray-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}