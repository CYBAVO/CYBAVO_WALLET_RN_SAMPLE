/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withTheme, Text } from 'react-native-paper';
import { View, Image } from 'react-native';
import { EXCHANGE_CURRENCIES } from '../store/actions';
import { hideString } from '../utils/Ext';
import {getExchangeAmountFromWallets, getWalletKeyByWallet} from '../Helpers';
// import { fetchCurrencyPricesIfNeed } from '../store/actions';
const CurrencyPriceText: () => React$Node = ({
  theme,
  wallets,
  textStyle = {},
  precision = 3,
  symbol = true,
  hide = false,
  note = false,
  imgSrc,
  imgStyle = {},
}) => {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.currencyPrice.loading);
  const balances = useSelector(state => state.balance.balances || {});
  const exchangeCurrency = useSelector(
    state => state.currencyPrice.exchangeCurrency
  );
  const currencyPrice = useSelector(
    state => state.currencyPrice.currencyPrice || {}
  );
  let exchangeAmount = getExchangeAmountFromWallets(
    wallets,
    exchangeCurrency,
    balances,
    currencyPrice,
    precision
  );
  return (
    <React.Fragment>
      {loading == false && exchangeAmount != null && (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text note={note} style={textStyle} numberOfLines={2}>
            {`≈${symbol ? exchangeCurrency : ''} \$${hideString(
              exchangeAmount,
              hide
            )}`}
          </Text>
          {imgSrc && <Image source={imgSrc} style={imgStyle} />}
        </View>
      )}
    </React.Fragment>
  );
};
export default withTheme(CurrencyPriceText);
