import React from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';

const DefaultLayout = require('./layouts/default-layout');

const HomepageStyles = styled.div`
  max-width: 767px;
  margin: auto;

  header {
    padding: 1em 0 2em 0;
  }

  main {
    padding: 1em 0;

    h1 {
      margin-bottom: 1.5rem;
    }

    h4 {
      margin-bottom: 1.5rem;
    }
  }

  footer {
    height: 100px;
    position: fixed;
    bottom: 0;
  }
`;

const Homepage = ({ title, endpoints }) => {
  const users = Object.keys(endpoints);
  return (
    <DefaultLayout title={title}>
      <HomepageStyles>
        <header>
          <h1>
            SUA Logistics App v1
          </h1>
          <p>
            Make your dispatches on this platform with our trusted dispatch agents
          </p>
        </header>
        <main>
          <h2>
            Getting Started
          </h2>
          <section>
            {users.map((user, userIndex) => (
              <article key={userIndex}>
                <h3>
                  {user === 'ngo' ? 'NGO' : user.replace(/^\w/, (firstChar) => firstChar.toUpperCase())}
                  {' accessible endpoints'}
                </h3>
                <ol>
                  {endpoints[user].map((routeDoc, routeDocIndex) => (
                    <li key={routeDocIndex}>
                      {Object.keys(routeDoc).map((docParameter, docParameterIndex) => (
                        <div key={docParameterIndex}>
                          <span style={{ fontWeight: 700 }}>
                            {`${docParameter}: `}
                          </span>
                          <span>{JSON.stringify(routeDoc[docParameter])}</span>
                        </div>
                      ))}
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </section>
        </main>
        <footer>
          <p>
            <span>LinkedIn: </span>
            <a href="https://www.linkedin.com/in/tobi-akanji-36a922149">Tobi Akanji</a>
          </p>
          <p>
            <span>GitHub: </span>
            <a href="https://github.com/Tboy-AK">Tboy-AK</a>
          </p>
        </footer>
      </HomepageStyles>
    </DefaultLayout>
  );
};

Homepage.propTypes = {
  title: propTypes.string,
  endpoints: propTypes.shape(propTypes.object),
};

Homepage.defaultProps = {
  title: '',
  endpoints: {},
};

module.exports = Homepage;
