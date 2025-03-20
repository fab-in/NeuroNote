import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState('flashcard');
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF or PPTX file');
        setFile(null);
      }
    }
  };

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value < 1 || value > 20) {
      setError('Number of questions must be between 1 and 20');
      return;
    }
    setNumQuestions(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (numQuestions < 1 || numQuestions > 20) {
      setError('Number of questions must be between 1 and 20');
      return;
    }

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const base64String = reader.result as string;
        
        // Create data object with all form data
        const formData = {
          file: base64String,
          questionType,
          numQuestions: numQuestions.toString()
        };

        // Encode the data and navigate to flashcards page
        const encodedData = encodeURIComponent(JSON.stringify(formData));
        navigate(`/flashcards?data=${encodedData}`);
      };
    } catch (err) {
      setError('Error processing file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Neuronote</h1>
          <p className="mt-2 text-gray-600">Upload your PDF or PPTX file to generate questions</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload File
            </label>
            <input
              type="file"
              accept=".pdf,.pptx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="flashcard">Flashcards</option>
              <option value="1marker">1 Marker</option>
              <option value="2marker">2 Markers</option>
              <option value="3marker">3 Markers</option>
              <option value="5marker">5 Markers</option>
              <option value="truefalse">True/False</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Number of Questions (1-20)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={handleNumQuestionsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">questions</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Choose how many questions you want to generate
            </p>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate Questions
          </button>
        </form>
      </div>
    </div>
  );
} 