import { Container, Heading, Columns, Loader } from 'react-bulma-components';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import getConfig from 'next/config';
import {
  ProductSortKeys,
  ProductsQuery,
  useProductsLazyQuery,
} from '../generated/graphql';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { ApolloError } from 'apollo-client';
import appendCurrencyToNumber from '../utils/appendCurrencyToNumber';

interface ProductQueryVariables {
  first?: number;
  last?: number;
  query: string;
  sortKey: ProductSortKeys;
  reverse: boolean;
  before?: string;
  after?: string;
}

const { NUMBER_OF_PRODUCTS_PER_PAGE } = getConfig().publicRuntimeConfig;

const Search = () => {
  const router = useRouter();
  const [
    productQueryVariables,
    setProductQueryVariables,
  ] = useState<ProductQueryVariables>({
    first: NUMBER_OF_PRODUCTS_PER_PAGE
      ? parseInt(NUMBER_OF_PRODUCTS_PER_PAGE)
      : 8,
    query: '',
    sortKey: ProductSortKeys.Title,
    reverse: false,
  });
  const [products, setProducts] = useState<ProductsQuery>({} as ProductsQuery);
  const [previousCursor, setPreviousCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [noProductMsg] = useState('No product found');
  const [page, setPage] = useState(1);

  const [productsQuery, { loading }] = useProductsLazyQuery({
    onCompleted: (data: ProductsQuery) => {
      setPreviousCursor(
        data.products.pageInfo.hasPreviousPage
          ? data.products.edges[0].cursor
          : null,
      );
      setNextCursor(
        data.products.pageInfo.hasNextPage
          ? data.products.edges[data.products.edges.length - 1].cursor
          : null,
      );
      setProducts(data);
    },
    onError: (error: ApolloError) => {
      console.error('error from products query', error);
    },
  });

  useEffect(() => {
    if (
      router.query.search &&
      (router.query.search as string).trim().length > 0
    ) {
      setProductQueryVariables({
        ...productQueryVariables,
        query: router.query && (router.query.search as string),
      });
      setPage(1);
    }
  }, [router.query]);

  const handlePreviousPageClicked = useCallback(() => {
    delete productQueryVariables.first;
    delete productQueryVariables.after;
    setProductQueryVariables({
      ...productQueryVariables,
      last: NUMBER_OF_PRODUCTS_PER_PAGE
        ? parseInt(NUMBER_OF_PRODUCTS_PER_PAGE)
        : 8,
      before: previousCursor,
    });
    setPage(page - 1);
  }, [previousCursor, productQueryVariables, page]);

  const handleNextPageClicked = useCallback(() => {
    delete productQueryVariables.last;
    delete productQueryVariables.before;
    setProductQueryVariables({
      ...productQueryVariables,
      first: NUMBER_OF_PRODUCTS_PER_PAGE
        ? parseInt(NUMBER_OF_PRODUCTS_PER_PAGE)
        : 8,
      after: nextCursor,
    });
    setPage(page + 1);
  }, [nextCursor, productQueryVariables, page]);

  useEffect(() => {
    refetchQuery();
  }, [productQueryVariables]);

  const refetchQuery = useCallback(async () => {
    try {
      productsQuery({
        variables: productQueryVariables,
      });
    } catch (error) {
      console.error('error from refetch products query', error);
    }
  }, [productQueryVariables]);

  return (
    <div>
      <Container className="collection-template">
        <Heading className="collection-title">
          {' '}
          {router.query.search
            ? `Search for "${router.query.search}"`
            : 'Products Found'}{' '}
        </Heading>
        <Columns.Column className="product-grid">
          <Columns>
            {products.products && products.products.edges.length > 0 ? (
              products.products.edges.map((product) => {
                let productInfo = product.node;
                return (
                  <ProductCard
                    size="one-fifth is-half-mobile"
                    image={
                      productInfo.images &&
                      productInfo.images.edges.length &&
                      productInfo.images.edges[0].node.transformedSrc
                    }
                    title={productInfo.title}
                    price={`${
                      productInfo.priceRange.minVariantPrice.amount !==
                      productInfo.priceRange.maxVariantPrice.amount
                        ? 'from '
                        : ''
                    } ${appendCurrencyToNumber(
                      productInfo.priceRange.minVariantPrice.currencyCode,
                      productInfo.priceRange.minVariantPrice.amount,
                    )}`}
                    handle={productInfo.handle}
                    key={productInfo.id}
                    idVariant={
                      productInfo.variants.edges &&
                      productInfo.variants.edges[0].node.id
                    }
                    countVariant={
                      productInfo.variants.edges &&
                      productInfo.variants.edges.length
                    }
                    totalInventory={
                      productInfo.variants.edges && product.node.totalInventory
                    }
                    compareAtPrice={
                      productInfo.variants.edges[0].node.compareAtPrice
                        ? appendCurrencyToNumber(
                            productInfo.priceRange.minVariantPrice.currencyCode,
                            productInfo.variants.edges[0].node.compareAtPrice,
                          )
                        : ''
                    }
                  />
                );
              })
            ) : loading ? (
              <Loader className="loader-override" />
            ) : (
              <Columns.Column className="no-product-msg">
                {noProductMsg}
              </Columns.Column>
            )}
          </Columns>

          <Pagination
            page={page}
            nextBtnDisabled={!nextCursor}
            handleNextPageClicked={handleNextPageClicked}
            previousBtnDisabled={!previousCursor}
            handlePreviousPageClicked={handlePreviousPageClicked}
            loading={loading}
          />
        </Columns.Column>
      </Container>
    </div>
  );
};

export default Search;
