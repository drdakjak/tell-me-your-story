import React from 'react';
import './App.css';
import Layout from './components/Layout';
import { Amplify } from 'aws-amplify';
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';


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
  }}, {
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
    // <div className="App">
    //   <Layout />
    // </div>

    <div>
      <h1>Thankyou for doing verification</h1>
      <h2>My Content</h2>
      <button onClick={signOut}>Sign out</button>
    </div>

  );
};

export default withAuthenticator(App);
