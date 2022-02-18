import { ChainId } from './constants';
import { Token } from '../entities/token';
import { serializeToken } from "./helpers"
import { SerializedToken } from "./types"


interface TokenList {
  [symbol: string]: Token
}

const defineTokens = <T extends TokenList>(t: T) => t

export const mainnetTokens = defineTokens({
  wokt: new Token(
    ChainId.MAINNET,
    '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    18,
    'WOKT',
    'Wrapped OKT',
    'https://www.okx.com/',
  ),
  okt: new Token(ChainId.MAINNET, '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15', 18, 'OKT', 'OKT', 'https://www.okx.com/'),
    daik: new Token(
    ChainId.MAINNET,
    '0x21cde7e32a6caf4742d00d44b07279e7596d26b9',
    18,
    'DAIK',
    'DAIK',
  ),
  usdt: new Token(
    ChainId.MAINNET,
    '0x382bb369d343125bfb2117af9c149795c6c65c50',
    18,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  ethk: new Token(ChainId.MAINNET, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETHK', 'ETHK', 'https://www.okx.com/'),

  // okb: new Token(ChainId.MAINNET, '0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2', 18, 'OKB', 'OKB', 'https://www.okx.com/'),
  // btck: new Token(ChainId.MAINNET, '0x54e4622dc504176b3bb432dccaf504569699a7ff', 18, 'BTCK', 'BTCK', 'https://www.okx.com/'),
  usdk: new Token(ChainId.MAINNET, '0xdcac52e001f5bd413aa6ea83956438f29098166b', 18, 'USDK', 'USDK', 'https://www.okx.com/'),
  busd: new Token(
    ChainId.MAINNET,
    '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    18,
    'BUSD',
    'Binance USD',
    'https://www.paxos.com/busd/',
  ),
  btcb: new Token(
    ChainId.MAINNET,
    '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    18,
    'BTCB',
    'Binance BTC',
    'https://bitcoin.org/',
  ),
  ust: new Token(
    ChainId.MAINNET,
    '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
    18,
    'UST',
    'Wrapped UST Token',
    'https://mirror.finance/',
  ),
  eth: new Token(
    ChainId.MAINNET,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Ethereum Token',
    'https://ethereum.org/en/',
  ),
  usdc: new Token(
    ChainId.MAINNET,
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    18,
    'USDC',
    'Binance-Peg USD Coin',
    'https://www.centre.io/usdc',
  ),
} as const)

export const testnetTokens = defineTokens({
  wokt: new Token(
    65,
    '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    18,
    'WOKT',
    'Wrapped OKT',
    'https://www.okx.com/',
  ),
  // bnb here points to the wbnb contract. Wherever the currency BNB is required, conditional checks for the symbol 'BNB' can be used
  okt: new Token(65, '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15', 18, 'OKT', 'OKT', 'https://www.okx.com/'),
  // okb: new Token(65, '0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2', 18, 'OKB', 'OKB', 'https://www.okx.com/'),
  // btck: new Token(65, '0x54e4622dc504176b3bb432dccaf504569699a7ff', 18, 'BTCK', 'BTCK', 'https://www.okx.com/'),
  ethk: new Token(65, '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', 18, 'ETHK', 'ETHK', 'https://www.okx.com/'),
  usdk: new Token(65, '0xdcac52e001f5bd413aa6ea83956438f29098166b', 18, 'USDK', 'USDK', 'https://www.okx.com/'),
  usdt: new Token(
    65,
    '0x382bb369d343125bfb2117af9c149795c6c65c50',
    18,
    'USDT',
    'Tether USD',
    'https://tether.to/',
  ),
  } as const)

type MainnetToken = keyof typeof mainnetTokens;
type TestnetToken = keyof typeof testnetTokens;

const tokens = () => {
  const chainId = '66';

  // If testnet - return list comprised of testnetTokens wherever they exist, and mainnetTokens where they don't
  if (parseInt(chainId, 10) === 65) {
    return Object.keys(mainnetTokens).reduce((accum, key) => {
      return { ...accum, [key]: testnetTokens[key as TestnetToken] || mainnetTokens[key as TestnetToken] }
    }, {} as typeof testnetTokens & typeof mainnetTokens)
  }

  return mainnetTokens
}

const unserializedTokens = tokens()

type SerializedTokenList = Record<keyof typeof unserializedTokens, SerializedToken>

export const serializeTokens = () => {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: serializeToken(unserializedTokens[key as MainnetToken]) }
  }, {} as SerializedTokenList)

  return serializedTokens
}

export default unserializedTokens
