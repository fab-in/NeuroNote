import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Question {
  question: string;
  answer: string;
}

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<string>('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = searchParams.get('data');
        if (!data) {
          throw new Error('No data provided');
        }

        const formData = new FormData();
        const parsedData = JSON.parse(decodeURIComponent(data));
        
        if (!parsedData || !parsedData.file) {
          throw new Error('Invalid data format');
        }

        // Set the question type
        setQuestionType(parsedData.questionType || 'flashcard');

        // Reconstruct FormData from parsed data
        Object.entries(parsedData).forEach(([key, value]) => {
          if (key === 'file') {
            // Convert base64 string back to File object
            const fileData = value as string;
            if (!fileData.includes(',')) {
              throw new Error('Invalid file data format');
            }
            const [type, base64] = fileData.split(',');
            const byteCharacters = atob(base64);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
              const slice = byteCharacters.slice(offset, offset + 1024);
              const byteNumbers = new Array(slice.length);
              
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, { type });
            const file = new File([blob], 'uploaded-file', { type });
            formData.append('file', file);
          } else {
            formData.append(key, value as string);
          }
        });

        const response = await fetch('http://localhost:3000/api/process-file', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || result.details || 'Failed to process file');
        }

        if (!result.questions || !Array.isArray(result.questions) || result.questions.length === 0) {
          throw new Error('No questions were generated. Please try again.');
        }

        setQuestions(result.questions);
        setCurrentIndex(0);
        setIsFlipped(false);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-lg text-gray-600">
            {questionType === 'flashcard' ? 'Flashcards' :
             questionType === '1marker' ? 'One-Mark Questions' :
             questionType === '2marker' ? 'Two-Mark Questions' :
             questionType === '3marker' ? 'Three-Mark Questions' :
             questionType === '5marker' ? 'Five-Mark Questions' :
             questionType === 'truefalse' ? 'True/False Questions' : 'Questions'}
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Next
          </button>
        </div>

        <div className="relative h-[400px] perspective-1000">
          <motion.div
            className={`relative w-full h-full cursor-pointer preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-8 flex items-center justify-center">
              <p className="text-2xl font-medium text-gray-800">
                {questions[currentIndex]?.question}
              </p>
            </div>
            <div className="absolute w-full h-full backface-hidden bg-blue-50 rounded-xl shadow-lg p-8 flex items-center justify-center rotate-y-180">
              <p className="text-2xl font-medium text-gray-800">
                {questions[currentIndex]?.answer}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 