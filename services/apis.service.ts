import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import 'isomorphic-fetch';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { SHOP, X_SHOPIFY_STOREFRONT_ACCESS_TOKEN } = publicRuntimeConfig;

export const shopify = new ApolloClient({
  ssrMode: true,
  connectToDevTools: true,
  link: new HttpLink({
    uri: `${SHOP}/api/graphql`,
    headers: {
      'X-Shopify-Storefront-Access-Token': X_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    mutate: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
  },
});
