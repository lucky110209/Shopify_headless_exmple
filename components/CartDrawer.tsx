import React, { useCallback, useEffect } from 'react';
import {
  Button,
  Section,
  Container,
  Columns,
  Heading,
  Image,
  Icon,
} from 'react-bulma-components';
import '../styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  useCheckoutLineItemsUpdateMutation,
  useCheckoutLineItemsRemoveMutation,
  CheckoutLineItemsRemoveMutation,
  CheckoutLineItemsUpdateMutation,
} from '.././generated/graphql';
import { useRecoilState } from 'recoil';
import { checkoutState } from './State';
import appendCurrencyToNumber from '../utils/appendCurrencyToNumber';

const CartDrawer = ({ active, handleCloseCart }) => {
  const classDrawer = `CartDrawerWrapper ${active ? 'active' : ''}`;
  const [checkout, setCheckout] = useRecoilState(checkoutState);
  const lineItems =
    checkout &&
    checkout.lineItems.edges.map((item) => {
      return {
        id: item.node.id,
        title: item.node.title,
        image: item.node.variant.image.transformedSrc,
        size: item.node.variant.title,
        currency: item.node.variant.priceV2.currencyCode,
        price: appendCurrencyToNumber(
          item.node.variant.priceV2.currencyCode,
          item.node.variant.priceV2.amount,
        ),
        quantity: item.node.quantity,
      };
    });
  useEffect(() => {
    const bodyWrapper = document.querySelector('body');
    active
      ? bodyWrapper.classList.add('no-scroll')
      : bodyWrapper.classList.remove('no-scroll');
    bodyWrapper.style.top = '-' + window.pageYOffset + 'px';
  });
  const totalPrice = `${
    checkout &&
    appendCurrencyToNumber(
      checkout.totalPriceV2.currencyCode,
      checkout.totalPriceV2.amount,
    )
  } ${checkout && checkout.totalPriceV2.currencyCode}`;

  const [checkoutLineItemsRemoveMutation] = useCheckoutLineItemsRemoveMutation({
    onCompleted: (data: CheckoutLineItemsRemoveMutation) => {
      if (
        data.checkoutLineItemsRemove &&
        data.checkoutLineItemsRemove.checkout
      ) {
        setCheckout(data.checkoutLineItemsRemove.checkout);
      }
    },
  });

  const [
    checkoutLineItemsUpdateMutation,
    { loading: lineItemsUpdateLoading },
  ] = useCheckoutLineItemsUpdateMutation({
    onCompleted: (data: CheckoutLineItemsUpdateMutation) => {
      if (
        data.checkoutLineItemsUpdate &&
        data.checkoutLineItemsUpdate.checkout
      ) {
        setCheckout(data.checkoutLineItemsUpdate.checkout);
      }
    },
  });

  const handleLineItemsRemove = useCallback(
    async (lineItemIds) => {
      await checkoutLineItemsRemoveMutation({
        variables: {
          checkoutId: checkout.id,
          lineItemIds: lineItemIds,
        },
      });
    },
    [checkout],
  );

  const handleLineItemsUpdate = useCallback(
    async (lineItemsUpdate) => {
      await checkoutLineItemsUpdateMutation({
        variables: {
          checkoutId: checkout.id,
          lineItems: lineItemsUpdate,
        },
      });
    },
    [checkout],
  );

  return (
    <div>
      <div className={classDrawer}>
        <Container className="CartDrawer__HeaderWrapper">
          <Heading align="center" className="CartDrawer__Header">
            Your bag
          </Heading>
          <span className="ButtonClose">
            <Icon>
              <FontAwesomeIcon onClick={handleCloseCart} icon={faTimes} />
            </Icon>
          </span>
        </Container>
        {lineItems && lineItems.length > 0 ? (
          <Section className="CartDrawer">
            <Container className="ContentWrapper">
              {lineItems.map(
                ({ title, id, image, size, currency, price, quantity }) => {
                  return (
                    <Columns className="cart-drawer" breakpoint="mobile">
                      <Columns.Column
                        size={4}
                        className="ProductItem__ImageWrapper"
                      >
                        <Image alt="64x64" src={image} />
                      </Columns.Column>
                      <Columns.Column size={8}>
                        <Heading size={6} className="ProductItem__Title">
                          {title}
                        </Heading>
                        {size !== 'Default Title' ? (
                          <p className="ProductItem__Size">{size}</p>
                        ) : (
                          ''
                        )}
                        <p className="ProductItem__Price">{`${price} ${currency}`}</p>
                        <div className="QuantitySelector__Wrapper">
                          <div className="QuantitySelector">
                            <Button
                              disabled={
                                quantity <= 1 || lineItemsUpdateLoading
                                  ? true
                                  : false
                              }
                              onClick={() => {
                                quantity--;
                                handleLineItemsUpdate([
                                  {
                                    id: id,
                                    quantity: quantity,
                                  },
                                ]);
                              }}
                            >
                              -
                            </Button>
                            <span className="ProductItem__Counter">
                              {quantity}
                            </span>
                            <Button
                              disabled={lineItemsUpdateLoading ? true : false}
                              onClick={() => {
                                quantity++;
                                handleLineItemsUpdate([
                                  {
                                    id: id,
                                    quantity: quantity,
                                  },
                                ]);
                              }}
                            >
                              +
                            </Button>
                          </div>
                          <a
                            onClick={() => {
                              handleLineItemsRemove([id]);
                            }}
                            className="ProductItem__Remove"
                          >
                            Remove
                          </a>
                        </div>
                      </Columns.Column>
                    </Columns>
                  );
                },
              )}
              <Columns className="PriceTotal" breakpoint="mobile">
                <Columns.Column>Total</Columns.Column>
                <Columns.Column align="right">{totalPrice}</Columns.Column>
              </Columns>
            </Container>
            <Container className="FooterWrapper">
              <Button
                onClick={() => {
                  window.open(checkout && checkout.webUrl);
                }}
                className="CheckoutButton"
                color="info"
              >
                Checkout
              </Button>
              <Button href="/cart" renderAs="a" className="CartButton">
                Your bag
              </Button>
            </Container>
          </Section>
        ) : (
          <div className="text-center">
            <p>Your bag is currently empty.</p>
            <p>
              Continue browsing <a href="/">here</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
