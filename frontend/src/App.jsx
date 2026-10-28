import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Layout from './components/layout/Layout.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import GraphPage from './pages/GraphPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RecommendationsPage from './pages/RecommendationsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="movies/:movieId" element={<MovieDetailsPage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
