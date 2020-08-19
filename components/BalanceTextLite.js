/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalance } from '../store/actions';
import { getWalletKey } from '../Helpers';
import { Text } from 'react-native-paper';
const BalanceTextLite: () => React$Node = ({
  textStyle = {},
  balanceItem = {},
}) => {
  const _effectiveBalance = () => {
    return balanceItem.tokenBalance || balanceItem.balance || '…';
  };
  return (
    <React.Fragment>
      {balanceItem && !balanceItem.loading && (
        <Text note style={textStyle}>
          {_effectiveBalance()}
        </Text>
      )}
    </React.Fragment>
  );
};
export default BalanceTextLite;
