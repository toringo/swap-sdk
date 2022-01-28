import { ChainId } from './index';
import { Token } from "../../libs";

export const WETH = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.TESTNET]: new Token(
    ChainId.TESTNET,
    '0xaE8E19eFB41e7b96815649A6a60785e1fbA84C1e',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  )
}