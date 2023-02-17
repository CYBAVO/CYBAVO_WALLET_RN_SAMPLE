import { isETHForkChain } from '../Helpers';
import { Coin } from '../Constants';

export function showActionButtonInWalletDetail(currency) {
  return currency === Coin.SOL || isETHForkChain(currency);
}
