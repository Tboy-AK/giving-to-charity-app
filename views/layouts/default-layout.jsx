import React from 'react';
import Container from 'react-bootstrap/Container';
import propTypes from 'prop-types';
import styled from 'styled-components';

const DefaultLayoutStyles = styled.div`
  padding: 1emvh 2em;
`;

const DefaultLayout = ({ title, children }) => (
  <html lang="en">
    <head>
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossOrigin="anonymous"
      />
      <title>{title}</title>
    </head>
    <body>
      <Container>
        <DefaultLayoutStyles>
          {children}
        </DefaultLayoutStyles>
      </Container>
    </body>
  </html>
);

DefaultLayout.propTypes = {
  title: propTypes.string.isRequired,
  children: propTypes.element.isRequired,
};

module.exports = DefaultLayout;
