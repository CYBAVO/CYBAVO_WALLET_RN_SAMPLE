import React from 'react';
import { withTheme, Button } from 'react-native-paper';

const CustomButton: () => React$Node = props => {
  return <Button {...props} uppercase={false} />;
};

export default withTheme(CustomButton);
