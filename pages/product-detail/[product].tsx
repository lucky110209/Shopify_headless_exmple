import React, { useCallback, useState } from 'react';
import {
  Button,
  Content,
  Section,
  Container,
  Columns,
  Element,
  Tile,
  Image,
  Form,
} from 'react-bulma-components';
import '../../styles/styles.css';
import {
  useProductQuery,
  ProductQuery,
  useCheckoutLineItemsAddMutation,
  ProductFragment,
} from '../../generated/graphql';
const { Field, Control, Label, Input, Select } = Form;
import { useRouter } from 'next/router';
import { ApolloError } from 'apollo-boost';
import appendCurrencyToNumber from '../../utils/appendCurrencyToNumber';
import { checkoutState, isOpenCartState } from '../../components/State';
import { useRecoilState } from 'recoil';
import ProductCarousel from '../../components/ProductCarousel';
import CartDrawer from '../../components/CartDrawer';

const ProductDetail = () => {
  const router = useRouter();
  const { product: productHandle } = router.query;
  const [product, setProduct] = useState<ProductFragment | null>(null);
  const [indexVariant, setIndexVariant] = useState(0);
  const [indexColor, setIndexColor] = useState(0);
  const [indexSize, setIndexSize] = useState(0);
  const [indexImage, setIndexImage] = useState(0);
  const [productQuantity, setProductQuantity] = useState(1);
  const [checkout, setCheckout] = useRecoilState(checkoutState);
  const [productId, setProductId] = useState('');
  const [isOpenCart, setIsOpenCart] = useRecoilState(isOpenCartState);

  const { loading } = useProductQuery({
    variables: {
      handle: productHandle as string,
    },
    onCompleted: (data: ProductQuery) => {
      if (data && data.productByHandle) {
        setProduct(data.productByHandle);
        setProductId(data.productByHandle.id);
        let checkVariantDefault = 0;
        while (
          data.productByHandle.variants.edges.length > 1 &&
          data.productByHandle.variants.edges[checkVariantDefault] &&
          data.productByHandle.variants.edges[checkVariantDefault].node
            .quantityAvailable === 0
        ) {
          if (
            data.productByHandle.variants.edges[checkVariantDefault + 1] &&
            data.productByHandle.variants.edges[checkVariantDefault + 1].node
              .quantityAvailable > 0
          ) {
            data.productByHandle.variants.edges[
              checkVariantDefault + 1
            ].node.selectedOptions.forEach((item) => {
              data.productByHandle.options.forEach((option) => {
                if (option.name === 'Size' && item.name === 'Size') {
                  setIndexSize(
                    option.values.findIndex((size) => item.value === size),
                  );
                }
                if (option.name === 'Color' && item.name === 'Color') {
                  setIndexColor(
                    option.values.findIndex((color) => item.value === color),
                  );
                }
              });
            });
            setIndexVariant(checkVariantDefault + 1);
            return;
          }
          checkVariantDefault++;
        }
      }
    },
    onError: (error: ApolloError) => {
      console.log(error);
    },
  });

  const [lineItemsAddMutation] = useCheckoutLineItemsAddMutation();

  const handleCloseCart = useCallback(() => {
    setIsOpenCart(false);
  }, []);

  const checkOutOfStock =
    product &&
    product.variants.edges.length > 0 &&
    product.variants.edges[indexVariant].node.quantityAvailable > 0 &&
    product.variants.edges[indexVariant].node.quantityAvailable -
      productQuantity >=
      0;

  const handleAddToCard = useCallback(async () => {
    const variables = {
      checkoutId: checkout.id,
      lineItems: [
        {
          variantId: product && product.variants.edges[indexVariant].node.id,
          quantity: productQuantity,
        },
      ],
    };
    if (checkOutOfStock) {
      const { data: response } = await lineItemsAddMutation({ variables });
      if (
        response &&
        response.checkoutLineItemsAdd &&
        response.checkoutLineItemsAdd.checkout
      ) {
        setCheckout(response.checkoutLineItemsAdd.checkout);
        setIsOpenCart(true);
      }
    }
  }, [checkout, productQuantity, product, indexVariant, checkOutOfStock]);

  const onChangeQuantity = useCallback((value) => {
    if (value.target.value >= 0) {
      setProductQuantity(parseInt(value.target.value));
    }
  }, []);

  const checkVariant = useCallback(
    (colorChange, sizeChange) => {
      let size: string;
      let color: string;
      product.options.forEach((option) => {
        if (option.name === 'Color') {
          color = option.values[colorChange];
        }
        if (option.name === 'Size') {
          size = option.values[sizeChange];
        }
      });

      product &&
        product.variants.edges.forEach((variant, index) => {
          if (
            (size &&
              color &&
              variant.node.title.includes(size) &&
              variant.node.title.includes(color)) ||
            (!color && size && variant.node.title.includes(size)) ||
            (!size && color && variant.node.title.includes(color))
          ) {
            setIndexVariant(index);
          }
        });
    },
    [product],
  );

  const handleChangeOptionProduct = useCallback(
    (typeOption, index) => {
      if (typeOption === 'Color') {
        setIndexColor(index);
        checkVariant(index, indexSize);
      } else {
        setIndexSize(index);
        checkVariant(indexColor, index);
      }
    },
    [product, indexSize, indexColor],
  );

  return (
    <React.Fragment>
      <CartDrawer active={isOpenCart} handleCloseCart={handleCloseCart} />
      {loading ? null : (
        <Section>
          <Container>
            <Columns>
              <Columns.Column size={5}>
                <Tile kind="ancestor" vertical>
                  <Tile kind="child">
                    <Element>
                      <Image
                        className="ProductImage__Main"
                        src={
                          product &&
                          product.images &&
                          product.images.edges &&
                          product.images.edges.length > 0 &&
                          product.images.edges[indexImage].node.transformedSrc
                        }
                        size="2by2"
                      />
                    </Element>
                  </Tile>
                  <Tile kind="child">
                    <Columns>
                      {product &&
                        product.images &&
                        product.images.edges &&
                        product.images.edges.length > 1 &&
                        product.images.edges.map((image, i) => {
                          return (
                            <Columns.Column size={3}>
                              <Image
                                onClick={() => setIndexImage(i)}
                                className="ProductThumbnail"
                                alt="64x64"
                                src={image.node.transformedSrc}
                                size="square"
                              />
                            </Columns.Column>
                          );
                        })}
                    </Columns>
                  </Tile>
                </Tile>
              </Columns.Column>
              <Columns.Column offset={1}>
                <Container className="ProductDetail">
                  <Content>
                    <h3 className="ProductTitle">{product && product.title}</h3>
                    <div className="ProductPrice__Container">
                      <span className="Price PriceSale">
                        {product &&
                          product.variants.edges[indexVariant].node.price &&
                          appendCurrencyToNumber(
                            product.priceRange.maxVariantPrice.currencyCode,
                            product.variants.edges[indexVariant].node.price,
                          )}
                      </span>
                      {product &&
                      product.variants.edges[indexVariant].node
                        .compareAtPrice &&
                      parseInt(
                        product.variants.edges[indexVariant].node.price,
                      ) <
                        parseInt(
                          product.variants.edges[indexVariant].node
                            .compareAtPrice,
                        ) ? (
                        <span
                          style={{
                            textDecorationLine: 'line-through',
                          }}
                          className="Price PriceOld"
                        >
                          {appendCurrencyToNumber(
                            product.priceRange.maxVariantPrice.currencyCode,
                            product.variants.edges[indexVariant].node
                              .compareAtPrice,
                          )}
                        </span>
                      ) : null}
                    </div>
                  </Content>
                  {product &&
                    product.options &&
                    product.options.length > 0 &&
                    product.options.map((option) => {
                      if (option.name === 'Color' || option.name === 'Size') {
                        return (
                          <Field>
                            <Label>{option.name}</Label>
                            <Control>
                              <Select
                                value={
                                  option.name === 'Color'
                                    ? indexColor
                                    : indexSize
                                }
                                onChange={(value) => {
                                  handleChangeOptionProduct(
                                    option.name,
                                    value.target.value,
                                  );
                                }}
                              >
                                {option.values.map((value, i) => {
                                  return <option value={i}>{value}</option>;
                                })}
                              </Select>
                            </Control>
                          </Field>
                        );
                      }
                    })}

                  <Field kind="group">
                    <Content className="QuantityContainer">
                      <Label className="QuantityLabel">Qty</Label>
                      <Control>
                        <Input
                          type="number"
                          value={productQuantity !== 0 ? productQuantity : ''}
                          onChange={onChangeQuantity}
                        />
                      </Control>
                    </Content>

                    <Control>
                      <Button
                        disabled={productQuantity > 0 ? false : true}
                        onClick={handleAddToCard}
                        type="primary"
                        className={
                          checkOutOfStock ? 'cartButton' : 'outOfStock'
                        }
                      >
                        {checkOutOfStock ? 'Add to cart' : 'Out of stock'}
                      </Button>
                    </Control>
                  </Field>

                  <Content>
                    <div
                      className="ProductDescr"
                      dangerouslySetInnerHTML={{
                        __html: product && product.descriptionHtml,
                      }}
                    ></div>
                  </Content>
                </Container>
              </Columns.Column>
            </Columns>
          </Container>
        </Section>
      )}
      <ProductCarousel productId={productId} />
    </React.Fragment>
  );
};

export default ProductDetail;
