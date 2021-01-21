import { Container, Navbar, Icon, Form, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useState, useCallback } from 'react';
import CartDrawer from './CartDrawer';
import { useRecoilState } from 'recoil';
import { checkoutState, isOpenCartState } from './State';
import { useRouter } from 'next/router';

const { Field, Control, Input } = Form;

const Header = () => {
  const router = useRouter();
  const [checkout] = useRecoilState(checkoutState);
  const [checkSearch, setCheckSearch] = useState(false);
  const [isOpenCart, setIsOpenCart] = useRecoilState(isOpenCartState);
  const [searchQuery, setSearchQuery] = useState('');

  const totalQuantityLineItem =
    checkout && checkout.lineItems
      ? checkout.lineItems.edges
          .map((item) => item.node.quantity)
          .reduce((prev, curr) => prev + curr, 0)
      : 0;

  const showSearch = useCallback(() => {
    setCheckSearch(true);
  }, []);
  const closeSearch = useCallback(() => {
    setCheckSearch(false);
  }, []);

  const showCart = useCallback(() => {
    if (!isOpenCart) {
      setIsOpenCart(!isOpenCart);
    }
  }, [isOpenCart]);

  const closeCart = useCallback(() => {
    setIsOpenCart(false);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleKeyPressed = useCallback(
    (event) => {
      if (
        (event.key === 'Enter' || event === 'click') &&
        searchQuery.trim().length > 0
      ) {
        router.push({
          pathname: '/search',
          query: { search: searchQuery.trim() },
        });
        setCheckSearch(false);
      }
    },
    [searchQuery],
  );

  return (
    <div className="header-navbar">
      <CartDrawer handleCloseCart={closeCart} active={isOpenCart}></CartDrawer>
      <Navbar>
        <Container>
          <Navbar.Brand>
            <Navbar.Container className="header-logo">
              <Navbar.Item renderAs="a" href="/">
                <img
                  src="https://bulma.io/images/bulma-logo.png"
                  alt="Bulma: a modern CSS framework based on Flexbox"
                  width="112"
                  height="28"
                />
              </Navbar.Item>
            </Navbar.Container>
            <Navbar.Container position="end" className="header-icon">
              <Navbar.Item
                href="#"
                className={
                  checkSearch ? 'header-search-form show' : 'header-search-form'
                }
              >
                <Field className="header-search">
                  <Button
                    renderAs="button"
                    className="close-search"
                    onClick={closeSearch}
                  >
                    <Icon>
                      <FontAwesomeIcon icon={faTimes} />
                    </Icon>
                  </Button>

                  <Control>
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyUp={handleKeyPressed}
                    />
                    <Button
                      onClick={() => handleKeyPressed('click')}
                      renderAs="button"
                    >
                      <Icon>
                        <FontAwesomeIcon icon={faSearch} />
                      </Icon>
                    </Button>
                  </Control>
                </Field>
              </Navbar.Item>
              <Navbar.Item
                href="#"
                className="header-search mobile"
                onClick={showSearch}
              >
                <Icon>
                  <FontAwesomeIcon icon={faSearch} />
                </Icon>
              </Navbar.Item>
              <Navbar.Item href="#" onClick={showCart} className="CartIcon">
                <Icon>
                  <FontAwesomeIcon icon={faShoppingCart} />
                </Icon>
                <span className="CartCount">{totalQuantityLineItem}</span>
              </Navbar.Item>
            </Navbar.Container>
          </Navbar.Brand>
        </Container>
        {checkSearch ? (
          <div className="search-background" onClick={closeSearch} />
        ) : null}
      </Navbar>
    </div>
  );
};

export default Header;
