/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrenciesIfNeed } from '../store/actions';
import { Text } from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
const CurrencyText: () => React$Node = ({
  currency,
  tokenAddress,
  currencySymbol,
  textStyle = {},
  symbol = false,
  note = false,
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.currency.loading);
  const currencyItem = useSelector(state => {
    return (state.currency.currencies || []).find(
      c => c.currency === currency && c.tokenAddress === tokenAddress
    );
  });
  useEffect(() => {
    dispatch(fetchCurrenciesIfNeed());
  }, [dispatch]);

  return (
    <React.Fragment>
      {loading && (
        <Text note={note} style={textStyle}>
          {currencySymbol}
        </Text>
      )}
      {!loading && currencyItem && (
        <Text note={note} style={textStyle}>
          {symbol ? currencyItem.symbol : currencyItem.displayName}
        </Text>
      )}
    </React.Fragment>
  );
};
export default CurrencyText;
