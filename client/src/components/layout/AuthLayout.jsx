import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-bloom-cream font-sans">
      {children}
    </div>
  );
};

export default AuthLayout;
