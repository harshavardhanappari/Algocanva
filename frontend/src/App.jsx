import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Algorithms from './pages/Algorithms.jsx';
import AlgorithmDetail from './pages/AlgorithmDetail.jsx';
import VisualizerIndex from './pages/VisualizerIndex.jsx';
import VisualizerPage from './pages/VisualizerPage.jsx';
import Problems from './pages/Problems.jsx';
import ProblemDetail from './pages/ProblemDetail.jsx';
import Notes from './pages/Notes.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import Progress from './pages/Progress.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="algorithms" element={<Algorithms />} />
        <Route path="algorithms/:slug" element={<AlgorithmDetail />} />
        <Route path="visualizer" element={<VisualizerIndex />} />
        <Route path="visualizer/:slug" element={<VisualizerPage />} />
        <Route path="problems" element={<Problems />} />
        <Route path="problems/:slug" element={<ProblemDetail />} />
        <Route path="notes" element={<Notes />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="progress" element={<Progress />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
