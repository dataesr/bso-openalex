import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './layout';
import Home from './pages/home';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/:countryCodes" element={<Home />} />
        <Route path="/" element={<Navigate to="/fr" replace />} />
      </Route>
    </Routes>
  );
}
