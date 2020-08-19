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
import { getWalletKeyByWallet } from '../Helpers';
// import { fetchCurrencyPricesIfNeed } from '../store/actions';
const CurrencyPriceTextLite: () => React$Node = ({
  textStyle = {},
  symbol = true,
  hide = false,
  note = false,
  imgSrc,
  imgStyle = {},
  exchangeAmount,
  exchangeCurrency,
}) => {
  return (
    <React.Fragment>
      {exchangeAmount != null && (
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
export default withTheme(CurrencyPriceTextLite);
