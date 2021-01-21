import { Columns, Image, Button } from 'react-bulma-components';
import { useCallback } from 'react';
import { checkoutState, isOpenCartState } from './State';
import { useRecoilState } from 'recoil';
import { useCheckoutLineItemsAddMutation } from '../generated/graphql';
interface ProductCardProps {
  size?: string;
  image: string;
  title: string;
  price: string;
  handle: string;
  idVariant: string;
  countVariant: number;
  totalInventory: number;
  handleOpenCart?: any;
  compareAtPrice: null | string;
}

const ProductCard = ({
  size,
  image,
  title,
  price,
  handle,
  idVariant,
  countVariant,
  totalInventory,
  compareAtPrice,
}: ProductCardProps) => {
  const [checkout, setCheckout] = useRecoilState(checkoutState);
  const [isOpenCart, setIsOpenCart] = useRecoilState(isOpenCartState);

  const [lineItemsAddMutation] = useCheckoutLineItemsAddMutation();

  const handleAddToCard = useCallback(async () => {
    const variables = {
      checkoutId: checkout.id,
      lineItems: [
        {
          variantId: idVariant,
          quantity: 1,
        },
      ],
    };
    const { data: response } = await lineItemsAddMutation({ variables });
    if (
      response &&
      response.checkoutLineItemsAdd &&
      response.checkoutLineItemsAdd.checkout
    ) {
      setCheckout(response.checkoutLineItemsAdd.checkout);
      setIsOpenCart(true);
    }
  }, [checkout, isOpenCart]);

  const checkContentButton =
    totalInventory > 0 ? (
      countVariant > 1 ? (
        <Button color="info">
          <a href={`/product-detail/${handle}`}>View details</a>
        </Button>
      ) : (
        <Button color="info" onClick={handleAddToCard}>
          Add to cart
        </Button>
      )
    ) : (
      <Button className="outOfStock" style={{ color: 'white' }}>
        Out of stock
      </Button>
    );
  return (
    <Columns.Column size={size ? size : 'one-quarter is-half-mobile'}>
      <a href={`/product-detail/${handle}`}>
        <Image
          rounded={false}
          src={
            image ? image : 'http://bulma.io/images/placeholders/640x480.png'
          }
          size="2by3"
        />
      </a>
      <h3>
        <a href={`/product-detail/${handle}`}>{title}</a>
      </h3>
      <p>
        <span style={compareAtPrice ? { color: 'red' } : {}}>{price}</span>{' '}
        {compareAtPrice ? (
          <span
            style={{
              textDecorationLine: 'line-through',
              color: '#b5b5b5',
            }}
          >
            {compareAtPrice}
          </span>
        ) : null}{' '}
      </p>
      {checkContentButton}
    </Columns.Column>
  );
};

export default ProductCard;
