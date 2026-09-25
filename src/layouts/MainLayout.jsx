import React from 'react';
import { Header } from '../components/common/Navigation';

// currentUser/onLogout props are accepted for older pages; the header reads the session from AuthContext.
export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-50">
      <Header />
      <main className="max-w-7xl mx-auto px-lg py-2xl">{children}</main>
    </div>
  );
};

export const SidebarLayout = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-brand-50">
      <Header />
      <div className="flex">
        {sidebar}
        <main className="flex-1 px-lg py-2xl">{children}</main>
      </div>
    </div>
  );
};
