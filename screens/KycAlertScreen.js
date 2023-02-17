import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal, Image, ScrollView } from 'react-native';
import {
  withTheme,
  ActivityIndicator,
  IconButton,
  Text,
} from 'react-native-paper';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { useDispatch } from 'react-redux';
import RoundButton2 from '../components/RoundButton2';
import { ROUND_BUTTON_FONT_SIZE, ROUND_BUTTON_HEIGHT } from '../Constants';
import NavigationService from '../NavigationService';
import Styles from '../styles/Styles';
import { Container } from 'native-base';
import Headerbar from '../components/Headerbar';
import backIcon from '../assets/image/ic_back.png';
import { Theme } from '../styles/MainTheme';
import I18n from 'react-native-i18n';

const KycAlertScreen: () => React$Node = ({ theme }) => {
  return (
    <Container style={[Styles.container]}>
      <Headerbar
        transparent
        actions={
          <IconButton
            borderless
            onPress={() => NavigationService.navigate('Assets')}
            icon={({ size, color }) => (
              <Image
                source={require('../assets/image/ic_cancel.png')}
                style={{ width: 24, height: 24 }}
              />
            )}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
          />
        }
      />

      <Text
        style={[
          {
            fontSize: 24,
            marginTop: 4,
            marginHorizontal: 24,
            color: theme.colors.primary,
          },
          Theme.fonts.default.heavy,
        ]}>
        {I18n.t('kyc_announce_title')}
      </Text>
      <ScrollView style={{ marginBottom: 16, marginTop: 32 }}>
        <Text
          style={{
            fontSize: 16,
            marginHorizontal: 24,
            color: '#B8BECA',
          }}>
          {I18n.t('kyc_announce_desc1')}
          <Text style={styles.highlightText}>
            {I18n.t('kyc_announce_desc2')}
          </Text>
          {I18n.t('kyc_announce_desc3')}
          <Text style={styles.highlightText}>
            {I18n.t('kyc_announce_desc4')}
          </Text>
          {I18n.t('kyc_announce_desc5')}
        </Text>
      </ScrollView>
      <RoundButton2
        height={ROUND_BUTTON_HEIGHT}
        style={[Styles.bottomButton]}
        labelStyle={[
          { color: theme.colors.text, fontSize: ROUND_BUTTON_FONT_SIZE },
        ]}
        onPress={() => {
          NavigationService.navigate('Settings', { startKyc: Date.now() });
        }}>
        {I18n.t('kyc_block_go')}
      </RoundButton2>
    </Container>
  );
};

const styles = StyleSheet.create({
  highlightText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default withTheme(KycAlertScreen);
