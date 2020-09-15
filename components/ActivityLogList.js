import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import I18n from '../i18n/i18n';
import Styles from '../styles/Styles';
import { Theme } from '../styles/MainTheme';
import { Surface, Text, withTheme } from 'react-native-paper';
import { SvgXml } from 'react-native-svg';

const ActivityLogList: () => React$Node = ({ theme, data, style = {} }) => {
  const SVG_CLOSE =
    '<svg width="24pt" height="24pt" viewBox="0 0 18 18" version="1.1">\n' +
    '<defs>\n' +
    '<clipPath id="clip1">\n' +
    '  <path d="M 1 1 L 17 1 L 17 17 L 1 17 Z M 1 1 "/>\n' +
    '</clipPath>\n' +
    '<clipPath id="clip2">\n' +
    '  <path d="M 9 17 C 13.417969 17 17 13.417969 17 9 C 17 4.582031 13.417969 1 9 1 C 4.582031 1 1 4.582031 1 9 C 1 13.417969 4.582031 17 9 17 Z M 9 17 "/>\n' +
    '</clipPath>\n' +
    '<clipPath id="clip3">\n' +
    '  <path d="M 5 5 L 13 5 L 13 13 L 5 13 Z M 5 5 "/>\n' +
    '</clipPath>\n' +
    '<clipPath id="clip4">\n' +
    '  <path d="M 12.535156 5.464844 C 12.898438 5.828125 12.925781 6.398438 12.613281 6.792969 L 12.535156 6.878906 L 10.414063 9 L 12.535156 11.121094 C 12.925781 11.511719 12.925781 12.144531 12.535156 12.535156 C 12.171875 12.898438 11.601563 12.925781 11.207031 12.613281 L 11.121094 12.535156 L 9 10.414063 L 6.878906 12.535156 C 6.488281 12.925781 5.855469 12.925781 5.464844 12.535156 C 5.101563 12.171875 5.074219 11.601563 5.386719 11.207031 L 5.464844 11.121094 L 7.585938 9 L 5.464844 6.878906 C 5.074219 6.488281 5.074219 5.855469 5.464844 5.464844 C 5.828125 5.101563 6.398438 5.074219 6.792969 5.386719 L 6.878906 5.464844 L 9 7.585938 L 11.121094 5.464844 C 11.511719 5.074219 12.144531 5.074219 12.535156 5.464844 Z M 12.535156 5.464844 "/>\n' +
    '</clipPath>\n' +
    '</defs>\n' +
    '<g id="surface1">\n' +
    '<g clip-path="url(#clip1)" clip-rule="nonzero">\n' +
    '<g clip-path="url(#clip2)" clip-rule="nonzero">\n' +
    '<rect x="0" y="0" width="18" height="18" style="fill:rgb(41.960144%,44.7052%,50.98114%);fill-opacity:1;stroke:none;"/>\n' +
    '</g>\n' +
    '</g>\n' +
    '<g clip-path="url(#clip3)" clip-rule="nonzero">\n' +
    '<g clip-path="url(#clip4)" clip-rule="nonzero">\n' +
    '<path style=" stroke:none;fill-rule:nonzero;fill:rgb(100%,100%,100%);fill-opacity:1;" d="M 9 -5.140625 L 23.140625 9 L 9 23.140625 L -5.140625 9 Z M 9 -5.140625 "/>\n' +
    '</g>\n' +
    '</g>\n' +
    '</g>\n' +
    '</svg>\n';
  const SVG_CHECK =
    '<svg\n' +
    '   viewBox="0 0 24 24"\n' +
    '   height="24"\n' +
    '   width="24"\n' +
    '   xml:space="preserve"\n' +
    '   id="svg2"\n' +
    '   version="1.1"><metadata\n' +
    '     id="metadata8"><rdf:RDF><cc:Work\n' +
    '         rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type\n' +
    '           rdf:resource="http://purl.org/dc/dcmitype/StillImage" /></cc:Work></rdf:RDF></metadata><defs\n' +
    '     id="defs6"><clipPath\n' +
    '       id="clipPath20"\n' +
    '       clipPathUnits="userSpaceOnUse"><path\n' +
    '         id="path18"\n' +
    '         d="m 9,1 c 4.41828,0 8,3.581722 8,8 0,4.41828 -3.58172,8 -8,8 C 4.581722,17 1,13.41828 1,9 1,4.581722 4.581722,1 9,1 Z" /></clipPath><clipPath\n' +
    '       id="clipPath26"\n' +
    '       clipPathUnits="userSpaceOnUse"><path\n' +
    '         id="path24"\n' +
    '         d="M -16,-112 H 359 V 1073 H -16 Z" /></clipPath><clipPath\n' +
    '       id="clipPath36"\n' +
    '       clipPathUnits="userSpaceOnUse"><path\n' +
    '         id="path34"\n' +
    '         d="m 11.50056,12.5961 c 0.32922,0.44344 0.95558,0.53603 1.39901,0.20681 0.40932,-0.3039 0.5197,-0.86097 0.27532,-1.29365 L 13.10638,11.4039 9.023016,5.903898 C 8.678307,5.439598 8.020988,5.369161 7.586759,5.725929 L 7.49732,5.80893 5.277212,8.130935 C 4.895545,8.530119 4.909745,9.163125 5.30893,9.544792 5.677408,9.897101 6.245119,9.912101 6.63047,9.598355 L 6.722788,9.513074 8.123,8.048 Z" /></clipPath><clipPath\n' +
    '       id="clipPath42"\n' +
    '       clipPathUnits="userSpaceOnUse"><path\n' +
    '         id="path40"\n' +
    '         d="M -16,-112 H 359 V 1073 H -16 Z" /></clipPath></defs><g\n' +
    '     transform="matrix(1.3333333,0,0,-1.3333333,0,24)"\n' +
    '     id="g10"><g\n' +
    '       id="g12" /><g\n' +
    '       id="g14"><g\n' +
    '         clip-path="url(#clipPath20)"\n' +
    '         id="g16"><g\n' +
    '           clip-path="url(#clipPath26)"\n' +
    '           id="g22"><path\n' +
    '             id="path28"\n' +
    '             style="fill:#6b7282;fill-opacity:1;fill-rule:nonzero;stroke:none"\n' +
    '             d="M -4,22 H 22 V -4 H -4 Z" /></g></g></g><g\n' +
    '       id="g30"><g\n' +
    '         clip-path="url(#clipPath36)"\n' +
    '         id="g32"><g\n' +
    '           clip-path="url(#clipPath42)"\n' +
    '           id="g38"><path\n' +
    '             id="path44"\n' +
    '             style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"\n' +
    '             d="M -1.577347e-6,18.00006 H 18.30353 V 0.4999817 H -1.577347e-6 Z" /></g></g></g></g></svg>';
  const replaceConfig = {
    init: {
      i18n: 'log_init_template',
      svg:
        '<svg width="24pt" height="24pt" viewBox="0 0 18 18" version="1.1">\n' +
        '<defs>\n' +
        '<clipPath id="clip1">\n' +
        '  <path d="M 1 1 L 17 1 L 17 17 L 1 17 Z M 1 1 "/>\n' +
        '</clipPath>\n' +
        '<clipPath id="clip2">\n' +
        '  <path d="M 9 17 C 13.417969 17 17 13.417969 17 9 C 17 4.582031 13.417969 1 9 1 C 4.582031 1 1 4.582031 1 9 C 1 13.417969 4.582031 17 9 17 Z M 9 17 "/>\n' +
        '</clipPath>\n' +
        '<clipPath id="clip3">\n' +
        '  <path d="M 4 4 L 14 4 L 14 14 L 4 14 Z M 4 4 "/>\n' +
        '</clipPath>\n' +
        '<clipPath id="clip4">\n' +
        '  <path d="M 9 4 C 9.511719 4 9.933594 4.386719 9.992188 4.882813 L 10 5 L 10 8 L 13 8 C 13.550781 8 14 8.449219 14 9 C 14 9.511719 13.613281 9.933594 13.117188 9.992188 L 13 10 L 10 10 L 10 13 C 10 13.550781 9.550781 14 9 14 C 8.488281 14 8.066406 13.613281 8.007813 13.117188 L 8 13 L 8 10 L 5 10 C 4.449219 10 4 9.550781 4 9 C 4 8.488281 4.386719 8.066406 4.882813 8.007813 L 5 8 L 8 8 L 8 5 C 8 4.449219 8.449219 4 9 4 Z M 9 4 "/>\n' +
        '</clipPath>\n' +
        '</defs>\n' +
        '<g id="surface1">\n' +
        '<g clip-path="url(#clip1)" clip-rule="nonzero">\n' +
        '<g clip-path="url(#clip2)" clip-rule="nonzero">\n' +
        '<rect x="0" y="0" width="18" height="18" style="fill:rgb(41.960144%,44.7052%,50.98114%);fill-opacity:1;stroke:none;"/>\n' +
        '</g>\n' +
        '</g>\n' +
        '<g clip-path="url(#clip3)" clip-rule="nonzero">\n' +
        '<g clip-path="url(#clip4)" clip-rule="nonzero">\n' +
        '<rect x="0" y="0" width="18" height="18" style="fill:rgb(100%,100%,100%);fill-opacity:1;stroke:none;"/>\n' +
        '</g>\n' +
        '</g>\n' +
        '</g>\n' +
        '</svg>',
    },
    accelerate: {
      i18n: 'log_accelerate_template',
      svg:
        '<svg\n' +
        '   viewBox="0 0 24 24"\n' +
        '   height="24"\n' +
        '   width="24"\n' +
        '   xml:space="preserve"\n' +
        '   id="svg2"\n' +
        '   version="1.1"><metadata\n' +
        '     id="metadata8"><rdf:RDF><cc:Work\n' +
        '         rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type\n' +
        '           rdf:resource="http://purl.org/dc/dcmitype/StillImage" /></cc:Work></rdf:RDF></metadata><defs\n' +
        '     id="defs6"><clipPath\n' +
        '       id="clipPath20"\n' +
        '       clipPathUnits="userSpaceOnUse"><path\n' +
        '         id="path18"\n' +
        '         d="m 9,1 c 4.41828,0 8,3.581722 8,8 0,4.41828 -3.58172,8 -8,8 C 4.581722,17 1,13.41828 1,9 1,4.581722 4.581722,1 9,1 Z" /></clipPath><clipPath\n' +
        '       id="clipPath26"\n' +
        '       clipPathUnits="userSpaceOnUse"><path\n' +
        '         id="path24"\n' +
        '         d="M -16,-157 H 359 V 1028 H -16 Z" /></clipPath><clipPath\n' +
        '       id="clipPath36"\n' +
        '       clipPathUnits="userSpaceOnUse"><path\n' +
        '         style="clip-rule:evenodd"\n' +
        '         id="path34"\n' +
        '         d="M 6.317478,4 C 6.274575,4 6.231556,4.011422 6.193382,4.035161 6.099271,4.093502 6.061789,4.208952 6.104231,4.309172 L 8.054715,8.908346 H 6.230634 c -0.078426,0 -0.15143,0.03852 -0.193872,0.102572 C 5.99432,9.074858 5.988207,9.155482 6.020615,9.224796 L 8.189076,13.86854 C 8.226444,13.9486 8.30856,14 8.399095,14 h 3.370215 c 0.08258,0 0.15893,-0.04289 0.19998,-0.11243 0.04118,-0.06953 0.04083,-0.15509 -6.9e-4,-0.2244 L 9.867725,10.16889 h 1.901585 c 0.09169,0 0.17473,-0.05263 0.2114,-0.13427 0.03668,-0.081405 0.02018,-0.176362 -0.04209,-0.241757 L 6.4869,4.071778 C 6.441806,4.024523 6.379988,4 6.317478,4 Z" /></clipPath><clipPath\n' +
        '       id="clipPath42"\n' +
        '       clipPathUnits="userSpaceOnUse"><path\n' +
        '         id="path40"\n' +
        '         d="M -16,-157 H 359 V 1028 H -16 Z" /></clipPath></defs><g\n' +
        '     transform="matrix(1.3333333,0,0,-1.3333333,0,24)"\n' +
        '     id="g10"><g\n' +
        '       id="g12" /><g\n' +
        '       id="g14"><g\n' +
        '         clip-path="url(#clipPath20)"\n' +
        '         id="g16"><g\n' +
        '           clip-path="url(#clipPath26)"\n' +
        '           id="g22"><path\n' +
        '             id="path28"\n' +
        '             style="fill:#6b7282;fill-opacity:1;fill-rule:nonzero;stroke:none"\n' +
        '             d="M -4,22 H 22 V -4 H -4 Z" /></g></g></g><g\n' +
        '       id="g30"><g\n' +
        '         clip-path="url(#clipPath36)"\n' +
        '         id="g32"><g\n' +
        '           clip-path="url(#clipPath42)"\n' +
        '           id="g38"><path\n' +
        '             id="path44"\n' +
        '             style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"\n' +
        '             d="M 1,19 H 17 V -1 H 1 Z" /></g></g></g></g></svg>',
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
