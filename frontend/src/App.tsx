import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import FlashcardPage from './pages/FlashcardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flashcard" element={<FlashcardPage />} />
    </Routes>
  );
}

export default App;