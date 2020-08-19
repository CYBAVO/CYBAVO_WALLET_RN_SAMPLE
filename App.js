import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, Container, Content } from 'native-base';
import ActionList from './components/TransactionList';

const App: () => React$Node = () => {
  // const initialized = useSelector(state => !!state.service.authenticator);
  const dispatch = useDispatch();


  return (
    <>
      <Container>
        <Content>
          {<ActionList />}
          {<Text>loading...</Text>}
        </Content>
      </Container>
    </>
  );
};

export default App;
