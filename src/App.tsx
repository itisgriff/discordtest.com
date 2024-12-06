import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Home } from '@/pages/Home';
import { VanityCheck } from '@/pages/VanityCheck';
import { UserLookup } from '@/pages/UserLookup';
import { Toaster } from '@/components/ui/toast';

function App() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vanity" element={<VanityCheck />} />
          <Route path="/lookup" element={<UserLookup />} />
        </Routes>
      </PageLayout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;