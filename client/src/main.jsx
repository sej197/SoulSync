import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupAllInterceptors } from './lib/axiosInterceptors';
import authapi from './lib/authapi';
import chatbotapi from './lib/chatbotapi';
import journalapi from './lib/journalapi';
import communityApi from './lib/communityApi';
import postApi from './lib/postApi';

// Register 429 interceptors on all axios instances
setupAllInterceptors([authapi, chatbotapi, journalapi, communityApi, postApi]);

const queryClient = new QueryClient();
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster />
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);