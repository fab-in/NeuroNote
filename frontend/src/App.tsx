import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Flashcards from './pages/Flashcard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flashcards" element={<Flashcards />} />
    </Routes>
  );
}

export default App;