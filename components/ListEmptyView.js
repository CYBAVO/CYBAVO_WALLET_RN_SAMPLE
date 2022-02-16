import { View, Image } from 'react-native';
import React from 'react';
import { Paragraph, withTheme } from 'react-native-paper';
import Styles from '../styles/Styles';
import I18n from '../i18n/i18n';
const ListEmptyView: () => React$Node = ({
  theme,
  text = I18n.t('no_item_text'),
  style = {},
  img,
  imgStyle = {},
}) => {
  return (
    <View style={[Styles.emptyContent, style]}>
      <Image
        source={img || require('../assets/image/ic_empty_data.png')}
        style={imgStyle}
      />
      <Paragraph style={{ color: theme.colors.placeholder, fontSize: 14, marginTop: 8 }}>
        {text}
      </Paragraph>
    </View>
  );
};
export default withTheme(ListEmptyView);
