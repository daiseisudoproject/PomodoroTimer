import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  // uri: 'http://localhost:8080/graphql', // Spring Boot GraphQLエンドポイント
  uri: 'https://pomodorotimer-2pyc.onrender.com/graphql',
  cache: new InMemoryCache()
});

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ApolloProvider client={client}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ApolloProvider>
  );
}

reportWebVitals();
