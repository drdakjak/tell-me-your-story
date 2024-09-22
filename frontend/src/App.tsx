import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import Home from './routes/Home';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from "aws-amplify/auth";
import { withAuthenticator } from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
    },
  },
  API: {
    REST: {
      "Api": {
        endpoint: import.meta.env.VITE_API_ENDPOINT,
        region: import.meta.env.VITE_API_REGION,
      },
    },
  }
}, {
  API: {
    REST: {
      headers: async () => {
        const tokens = (await fetchAuthSession()).tokens;
        const jwt = tokens?.idToken?.toString();
        return {
          "authorization": `Bearer ${jwt}`
        };
      }
    }
  }
});

interface AppProps {
  signOut: () => void;
}

const App: React.FC<AppProps> = ({ signOut }) => {

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/job-post" element={<Layout signOut={signOut} />} />
          <Route path="/resume" element={<Layout signOut={signOut} />} />
          <Route path="/editor" element={<Layout signOut={signOut} />} />
          <Route path="/tailored-resume" element={<Layout signOut={signOut} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default withAuthenticator(App);
