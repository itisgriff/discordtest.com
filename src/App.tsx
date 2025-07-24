import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toaster } from '@/components/ui/toast';

// Lazy load pages for better code splitting
const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })));
const VanityCheck = lazy(() => import('@/pages/VanityCheck'));
const UserLookup = lazy(() => import('@/pages/UserLookup'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function App() {
  return (
    <Router>
      <PageLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vanity" element={<VanityCheck />} />
            <Route path="/vanity/:code" element={<VanityCheck />} />
            <Route path="/lookup" element={<UserLookup />} />
            <Route path="/lookup/:userId" element={<UserLookup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageLayout>
      <Toaster />
    </Router>
  );
}

export default App;