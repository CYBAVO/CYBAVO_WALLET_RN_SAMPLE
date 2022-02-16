import { StyleSheet, View, Image } from 'react-native';
import { SvgUri, SvgXml } from 'react-native-svg';
import React, { useState } from 'react';

function IconSvgXmlGeneral({
  style = {},
  width = '56',
  height = '56',
  url,
  placeholder,
}) {
  const [useUnknown, setUseUnknown] = useState(false);

  if (useUnknown || !url) {
    return <Image source={placeholder} style={style} />;
  }
  if (url.endsWith('.svg')) {
    return (
      <SvgUri
        onError={() => {
          setUseUnknown(true);
        }}
        width={width}
        height={height}
        style={style}
        uri={url}
      />
    );
  } else {
    return (
      <Image
        source={{
          uri: url,
        }}
        onError={() => {
          setUseUnknown(true);
        }}
        style={style}
        resizeMode={'contain'}
      />
    );
  }
}

export default IconSvgXmlGeneral;
