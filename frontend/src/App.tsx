import React from 'react';
import './App.css';
import Layout from './components/Layout';
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

const App: React.FC = ({ signOut }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
      <Layout signOut={signOut} />
    </div>
  );
};

export default withAuthenticator(App);
