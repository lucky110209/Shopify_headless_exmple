import React, { useCallback } from 'react';
import '../styles/styles.css';
import {
  Container,
  Section,
  Table,
  Button,
  Heading,
  Image,
} from 'react-bulma-components';
import { useRecoilState } from 'recoil';
import { checkoutState } from '../components/State';
import appendCurrencyToNumber from '../utils/appendCurrencyToNumber';
import {
  useCheckoutLineItemsRemoveMutation,
  useCheckoutLineItemsUpdateMutation,
  CheckoutLineItemsRemoveMutation,
  CheckoutLineItemsUpdateMutation,
} from '../generated/graphql';

const Cart = () => {
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
        handle: item.node.variant.product.handle,
      };
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
    <React.Fragment>
      <Heading className="Section__Header" align="center">
        Shopping bag
      </Heading>
      {lineItems && lineItems.length > 0 ? (
        <Section>
          <Container className="Cart">
            <Table>
              <thead className="CartProduct__Header">
                <tr>
                  <th colSpan={2}>Item</th>
                  <th align="center" className="hidden-mobile">
                    Quantity
                  </th>
                  <th align="center" className="hidden-mobile">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(
                  ({
                    id,
                    title,
                    size,
                    image,
                    currency,
                    price,
                    quantity,
                    handle,
                  }) => (
                    <tr key={id}>
                      <td className="test ProductItem__ImageWrapper">
                        <Image className="ProductItem__Image" src={image} />
                      </td>
                      <td className="ProductItem__InfoWrapper">
                        <div className="ProductItem__Info">
                          <a href={`/product-detail/${handle}`}>
                            <Heading className="ProductItem__Title" size={5}>
                              {title}
                            </Heading>
                          </a>
                          {size !== 'Default Title' ? (
                            <Heading
                              className="ProductItem__Size"
                              subtitle
                              size={6}
                            >
                              {size}
                            </Heading>
                          ) : (
                            ''
                          )}

                          <div className="ProductItem__Price">
                            <span>{price}</span> <span>{currency}</span>
                          </div>
                        </div>
                      </td>
                      <td className="QuantitySelector__Wrapper">
                        <div>
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
                              disabled={lineItemsUpdateLoading}
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
                            onClick={() => handleLineItemsRemove([id])}
                            className="ProductItem__Remove"
                          >
                            Remove
                          </a>
                        </div>
                      </td>
                      <td className=" hidden-mobile" align="center">
                        <div className="ProductItem__Price PriceSubtotal">
                          <span>{price}</span> <span>{currency}</span>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </Table>
            <Table>
              <tfoot>
                <tr>
                  <th colSpan={2}>
                    <a href="/" className="Link">
                      {' '}
                      Continue shopping{' '}
                    </a>
                  </th>
                  <th>Total</th>
                  <th>{totalPrice}</th>
                </tr>
              </tfoot>
            </Table>
            <Container className="Checkout__Wrapper">
              <Button
                onClick={() => {
                  window.open(checkout && checkout.webUrl);
                }}
                color="info"
              >
                Checkout
              </Button>
            </Container>
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
    </React.Fragment>
  );
};

export default Cart;
