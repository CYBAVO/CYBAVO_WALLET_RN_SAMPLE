/**
 * Copyright (c) 2019 CYBAVO, Inc.
 * https://www.cybavo.com
 *
 * All rights reserved.
 */
import React, { useState } from 'react';
import { Button, Icon } from 'native-base';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import {
  TextInput,
  Text,
  Portal,
  withTheme,
  IconButton,
} from 'react-native-paper';
import { Theme } from '../styles/MainTheme';
import Styles from '../styles/Styles';
import { CLEAR_ICON, SCAN_ICON } from '../Constants';
const CompoundTextInput = React.forwardRef(
  (
    {
      theme,
      value,
      maxLength,
      autoCapitalize = 'none',
      keyboardType = 'email-address',
      underlineColor = Theme.colors.normalUnderline,
      hasError,
      onChangeText = value => {},
      onBlur = () => {},
      errorMsg = {},
      goScan,
      convertText,
      placeholder,
      style = { marginHorizontal: 16 },
      label,
      onSubmitEditing,
      onClear,
      availableBalance,
      onPressAvailableBalance,
      ...props
    },
    ref
  ) => {
    const [inputHeight, setInputHeight] = useState(null);
    const _getPaddingRight = () => {
      let value = 0;
      if (onClear) {
        value += 24;
      }
      if (goScan) {
        value += 24;
      }
      return value;
    };
    const _getPaddingBottom = () => {
      let value = 10;
      if (convertText) {
        value += 20;
      }
      return value;
    };
    return (
      <React.Fragment>
        <Portal.Host>
          <TextInput
            {...props}
            ref={ref}
            maxLength={maxLength}
            style={[
              Styles.input,
              style,
              {
                flex: null,
                paddingVertical: 16,
                paddingBottom: _getPaddingBottom(), // space between underline and value
                paddingRight: _getPaddingRight(),
                height:
                  label != null && Platform.OS === 'ios' ? null : inputHeight, //if there's label, use inputHeight will cause issue on iOS
              },
            ]}
            onContentSizeChange={
              e => setInputHeight(e.nativeEvent.contentSize.height) // make height normal when text exceed a line
            }
            // clearButtonMode="always"
            label={label}
            value={value}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            underlineColor={underlineColor}
            returnKeyType="done"
            error={hasError}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={onSubmitEditing ? false : true}
          />
          {onClear && (
            <IconButton
              borderless
              disabled={!value}
              style={{
                width: 24,
                height: 24,
                position: 'absolute',
                right: goScan ? 40 : 5,
                bottom: 10,
              }}
              // accessibilityLabel={clearAccessibilityLabel}
              color={'rgba(255, 255, 255, 0.56)'}
              // rippleColor={rippleColor}
              onPress={onClear}
              icon={({ size, color }) =>
                value ? (
                  <Image
                    source={CLEAR_ICON}
                    style={{ width: 24, height: 24 }}
                  />
                ) : (
                  <View style={{ width: 24, height: 24 }} />
                )
              }
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          )}
          {goScan && (
            <IconButton
              borderless
              style={{ position: 'absolute', right: 5, bottom: 5 }}
              // accessibilityLabel={clearAccessibilityLabel}
              color={'rgba(255, 255, 255, 0.56)'}
              // rippleColor={rippleColor}
              onPress={goScan}
              icon={({ size, color }) => (
                <Image source={SCAN_ICON} style={{ width: 24, height: 24 }} />
              )}
              accessibilityTraits="button"
              accessibilityComponentType="button"
              accessibilityRole="button"
            />
          )}
          {convertText && (
            <Text
              style={[
                Styles.convertedNumText,
                style,
                {
                  position: 'absolute',
                  left: 10,
                  bottom: 10,
                  textAlign: 'left',
                  fontSize: 12,
                },
              ]}>
              {convertText}
            </Text>
          )}
        </Portal.Host>
        {availableBalance && (
          <TouchableOpacity
            onPress={() => {
              if (onPressAvailableBalance) {
                onPressAvailableBalance();
              }
            }}>
            <Text style={[Styles.inputAvailableValue, style]}>
              {availableBalance}
            </Text>
          </TouchableOpacity>
        )}
        {hasError && (
          <Text style={[Styles.inputError, style]}>
            {hasError ? errorMsg : ''}
          </Text>
        )}
      </React.Fragment>
    );
    // );
  }
);
export default withTheme(CompoundTextInput);
