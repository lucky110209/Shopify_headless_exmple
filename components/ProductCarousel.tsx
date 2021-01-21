import React, { useState } from 'react';
import Carousel from 'react-elastic-carousel';
import {
  useProductRecommendationsQuery,
  ProductRecommendationsQuery,
} from '../generated/graphql';
import appendCurrencyToNumber from '../utils/appendCurrencyToNumber';
import { Content, Image } from 'react-bulma-components';
import '../styles/styles.css';

const breakPoints = [
  { width: 1, itemsToShow: 1 },
  { width: 550, itemsToShow: 3, itemsToScroll: 1, pagination: false },
  { width: 850, itemsToShow: 4 },
  { width: 1150, itemsToShow: 4, itemsToScroll: 2, pagination: false },
];

const ProductCarousel = ({ productId }) => {
  const [
    productRecommendations,
    setProductRecommendations,
  ] = useState<ProductRecommendationsQuery | null>(null);

  useProductRecommendationsQuery({
    variables: {
      productId: productId,
    },
    onCompleted: (data: ProductRecommendationsQuery) => {
      console.log(data);
      if (data && data.productRecommendations.length > 0) {
        setProductRecommendations(data);
      }
    },
  });

  return (
    <React.Fragment>
      {productRecommendations &&
      productRecommendations.productRecommendations.length > 0 ? (
        <Carousel breakPoints={breakPoints}>
          {productRecommendations &&
            productRecommendations.productRecommendations.map((item) => {
              return (
                <div className="Product__Item">
                  <a href={`/product-detail/${item.handle}`}>
                    <Image
                      alt="64x64"
                      src={item.variants.edges[0].node.image.transformedSrc}
                    />
                    <Content align="center">
                      <h3 className="ProductTitle">{item.title}</h3>
                      <div className="ProductPrice__Container">
                        <span className="Price PriceSale">
                          {item.variants.edges[0].node.price &&
                            appendCurrencyToNumber(
                              item.priceRange.maxVariantPrice.currencyCode,
                              item.variants.edges[0].node.price,
                            )}
                        </span>
                        {item.variants.edges[0].node.compareAtPrice &&
                        parseInt(item.variants.edges[0].node.price) <
                          parseInt(
                            item.variants.edges[0].node.compareAtPrice,
                          ) ? (
                          <span
                            style={{
                              textDecorationLine: 'line-through',
                              color: 'darkgray',
                            }}
                            className="Price PriceOld"
                          >
                            {appendCurrencyToNumber(
                              item.priceRange.maxVariantPrice.currencyCode,
                              item.variants.edges[0].node.compareAtPrice,
                            )}
                          </span>
                        ) : null}
                      </div>
                    </Content>
                  </a>
                </div>
              );
            })}
        </Carousel>
      ) : null}
    </React.Fragment>
  );
};

export default ProductCarousel;
