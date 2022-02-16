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
  isErc1155,
  tokenIdIndex,
}) => {
  const _effectiveBalance = () => {
    if (isErc1155) {
      if (tokenIdIndex == null) {
        return balanceItem.tokenIdAmounts.length || '0';
      } else {
        return balanceItem.tokenIdAmounts[tokenIdIndex].amount || '0';
      }
    } else if (balanceItem.tokenAddress) {
      return balanceItem.tokenBalance || '0';
    } else {
      return balanceItem.balance || '0';
    }
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
