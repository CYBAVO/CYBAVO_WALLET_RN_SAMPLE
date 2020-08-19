import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import I18n from '../i18n/i18n';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { Surface, Text, withTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

const ActivityLogList: () => React$Node = ({ theme, data, style = {} }) => {
  const SVG_CLOSE =
    '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" /></svg>';
  const SVG_CHECK =
    '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" /></svg>';
  const replaceConfig = {
    init: {
      i18n: 'log_init_template',
      svg:
        '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>',
    },
    accelerate: {
      i18n: 'log_accelerate_template',
      svg:
        '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="currentColor" d="M2 12A10 10 0 1 0 12 2A10 10 0 0 0 2 12M15.6 13.72A4 4 0 0 0 16 12A4 4 0 0 0 12 8V10L8.88 7L12 4V6A6 6 0 0 1 18 12A5.9 5.9 0 0 1 17.07 15.19M6 12A5.9 5.9 0 0 1 6.93 8.81L8.4 10.28A4 4 0 0 0 8 12A4 4 0 0 0 12 16V14L15 17L12 20V18A6 6 0 0 1 6 12Z" /></svg>',
    },
    cancel: {
      i18n: 'log_cancel_template',
      svg: SVG_CLOSE,
    },
    accelerateSuccess: {
      i18n: 'transaction_successfully_accelerated',
      svg: SVG_CHECK,
    },
    failed: {
      i18n: 'transaction_failed',
      svg: SVG_CLOSE,
    },
    accelerateFailed: {
      i18n: 'transaction_confirmed_accelerate_fail',
      svg: SVG_CHECK,
    },
    cancelFailed: {
      i18n: 'transaction_confirmed_cancel_fail',
      svg: SVG_CHECK,
    },
    cancelSuccess: {
      i18n: 'transaction_successfully_cancelled',
      svg: SVG_CLOSE,
    },
  };
  const _renderItem = ({ item, index }) => {
    return (
      <Surface
        style={{
          flexDirection: 'row',
          backgroundColor: theme.colors.background,
        }}>
        <View
          style={{
            // paddingRight: 16,
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
          }}>
          {index > 0 && (
            <View
              style={{
                width: 1,
                backgroundColor: theme.colors.white35,
                flex: 1,
              }}
            />
          )}
          <SvgXml
            xml={replaceConfig[item.type].svg}
            style={{
              tintColor: theme.colors.white35,
              width: 24,
              height: 24,
            }}
          />
          <View
            style={{
              width: index == data.length - 1 ? 0 : 1,
              backgroundColor: theme.colors.white35,
              flex: 1,
            }}
          />
        </View>
        <View style={[Styles.itemBody, { paddingTop: index > 0 ? 14 : 0 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 8,
            }}>
            <Text style={[Styles.secContent]}>
              {I18n.t(replaceConfig[item.type].i18n, item)}
            </Text>
          </View>
        </View>
      </Surface>
    );
  };
  return (
    <View
      style={[
        styles.listContent,
        { backgroundColor: theme.colors.background },
        style,
      ]}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={data}
        keyExtractor={(log, idx) => `${log.time}#${idx}`}
        renderItem={_renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  item: {
    padding: 10,
    height: 80,
  },
  separator: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  text: {
    fontSize: 15,
    color: 'black',
  },
  footer: {
    height: 88,
    paddingTop: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: Theme.colors.text,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default withTheme(ActivityLogList);
