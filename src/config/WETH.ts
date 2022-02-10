import { ChainId, Token } from '..';

export const WETH = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    18,
    'WOKT',
    'Wrapped OKT',
    'https://www.okx.com'
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