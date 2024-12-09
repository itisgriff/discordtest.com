import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Home } from '@/pages/Home';
import VanityCheck from '@/pages/VanityCheck';
import UserLookup from '@/pages/UserLookup';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toast';

export function App() {
  return (
    <Router>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vanity" element={<VanityCheck />} />
          <Route path="/vanity/:code" element={<VanityCheck />} />
          <Route path="/lookup" element={<UserLookup />} />
          <Route path="/lookup/:userId" element={<UserLookup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageLayout>
      <Toaster />
    </Router>
  );
}

export default App;