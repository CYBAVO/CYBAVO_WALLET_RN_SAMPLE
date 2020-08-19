/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Button } from 'native-base';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Theme } from '../styles/MainTheme';
import { Text, TouchableRipple } from 'react-native-paper';
import Styles from '../styles/Styles';

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  filter: {
    // opacity: 0.5,
    backgroundColor: Theme.colors.pickerBg,
    marginRight: 5,
    // paddingHorizontal: 8,
    // minWidth: 80,
  },
  filterText: {
    color: Theme.colors.text,
    textAlign: 'center',
    fontSize: 12,
  },
  filterActive: {
    backgroundColor: Theme.colors.primary,
    opacity: 1,
  },
  filterTextActive: {
    color: Theme.colors.text,
  },
  first: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderLeftWidth: 1,
  },
  last: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderLeftWidth: 0,
  },
});

export default class SingleSelect extends Component {
  render() {
    const {
      options = [],
      selected,
      onChange,
      containerStyle,
      getOptionText = opt => opt,
    } = this.props;
    return (
      <View style={[styles.filterRow, containerStyle]}>
        {options.map((opt, idx) => (
          <TouchableRipple
            key={idx}
            onPress={() => onChange(idx)}
            style={[
              Styles.tag,
              styles.filter,
              idx === selected ? styles.filterActive : {},
            ]}>
            <Text
              style={[
                Theme.fonts.default.heavy,
                styles.filterText,
                idx === selected ? styles.filterTextActive : {},
              ]}>
              {getOptionText(opt)}
            </Text>
          </TouchableRipple>
        ))}
      </View>
    );
  }
}
