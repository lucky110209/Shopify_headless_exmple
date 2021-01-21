import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { shopify } from '../services/apis.service';
import { RecoilRoot } from 'recoil';
import RecoilWrapper from '../components/RecoilWrapper';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'react-bulma-components/dist/react-bulma-components.min.css';
import '../styles/style.css';

function _app({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ApolloProvider client={shopify}>
        <RecoilWrapper>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </RecoilWrapper>
      </ApolloProvider>
    </RecoilRoot>
  );
}

export default _app;
