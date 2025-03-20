import React, { useState } from 'react';
import { Upload, Brain, History } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState('1marker');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
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
      
      if (!response.data || !response.data.questions) {
        throw new Error('Invalid response format from server');
      }

      // Navigate to flashcard page with the data
      navigate('/flashcard', {
        state: {
          flashcardData: {
            summary: response.data.summary || '',
            questions: response.data.questions,
            questionType: response.data.questionType
          }
        }
      });
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
        <h1 className="text-3xl font-bold text-white mb-8">Generate Flashcards</h1>
        
        <div className="max-w-3xl mx-auto space-y-8">
          {/* File Upload Box */}
          <div>
            <label
              htmlFor="file-upload"
              className="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-indigo-500 transition-colors bg-gray-800"
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-300">
                <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
                <br />
                PDF or PPTX files (max 5MB)
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="1marker">One Mark</option>
              <option value="2marker">Two Mark</option>
              <option value="5marker">Five Mark</option>
              <option value="truefalse">True/False</option>
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
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}