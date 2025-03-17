import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Brain, History } from 'lucide-react';

export default function Home() {
  const [questionType, setQuestionType] = useState('1-marker');
  const [questionCount, setQuestionCount] = useState(5);
  const navigate = useNavigate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
  };

  const handleGenerate = () => {
    navigate('/flashcard');
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
          {/* Add history items here */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Generate Flashcards</h1>
        
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
                PPT or PDF files
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Question Configuration */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="1-marker">1-marker</option>
                <option value="3-marker">3-marker</option>
                <option value="5-marker">5-marker</option>
                <option value="true-false">True/False</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                min="1"
                max="20"
                className="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
          >
            Generate Flashcards
          </button>
        </div>
      </div>
    </div>
  );
}