require('dotenv').config();
const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  publicRuntimeConfig: {
    NUMBER_OF_PRODUCTS_PER_PAGE: process.env.NUMBER_OF_PRODUCTS_PER_PAGE,
    SHOP: process.env.SHOP,
    X_SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.X_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
});
