import {
  Container,
  Content,
  Footer as BulmaFooter,
} from 'react-bulma-components';

const Footer = () => {
  return (
    <Container>
      <BulmaFooter>
        <Content style={{ textAlign: 'center' }}>
          <p>Copyright &copy; 2020 Happypoints.io</p>
        </Content>
      </BulmaFooter>
    </Container>
  );
};

export default Footer;
