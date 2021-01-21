import { atom, DefaultValue } from 'recoil';
import { CheckoutFragment } from '../generated/graphql';
const localStorageEffect = (key) => ({ setSelf, onSet }) => {
  if (process.browser) {
    const savedValue = localStorage && localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }
    onSet((newValue) => {
      if (newValue instanceof DefaultValue) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    });
  }
};
export const checkoutState = atom<CheckoutFragment>({
  key: 'checkoutState',
  default: null,
  effects_UNSTABLE: [localStorageEffect('checkout')],
});

export const isOpenCartState = atom<boolean>({
  key: 'isOpenCartState',
  default: false,
});
