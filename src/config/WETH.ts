import { ChainId, Token } from '..';

export const WETH = {
  [ChainId.MAINNET]: new Token(
    ChainId.BNB,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.com/',
  ),
  [ChainId.TESTNET]: new Token(
    ChainId.TESTNET,
    '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    18,
    'WOKT',
    'Wrapped OKT',
    'https://www.okx.com'
  )
}