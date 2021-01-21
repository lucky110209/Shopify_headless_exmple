import {
  CheckoutCreateMutation,
  useCheckoutCreateMutation,
  useCheckoutQuery,
} from '../generated/graphql';
import { useEffect } from 'react';
import { checkoutState } from './State';
import { useRecoilState } from 'recoil';

const RecoilWrapper = ({ children }) => {
  const [checkout, setCheckout] = useRecoilState(checkoutState);
  let [checkoutCreate] = useCheckoutCreateMutation({
    onCompleted: (data: CheckoutCreateMutation) => {
      if (data.checkoutCreate && data.checkoutCreate.checkout) {
        setCheckout(data.checkoutCreate.checkout);
      }
    },
  });

  useCheckoutQuery({
    variables: {
      checkoutId: checkout && checkout.id,
    },
    onCompleted: async (data: any) => {
      if (data.node && !data.node.orderStatusUrl) {
        setCheckout(data.node);
      } else {
        await checkoutCreate();
      }
    },
  });

  useEffect(() => {
    if (!checkout) {
      (async () => {
        await checkoutCreate();
      })();
    }
  }, [checkout]);
  return <>{children}</>;
};

export default RecoilWrapper;
