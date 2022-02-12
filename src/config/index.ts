import JSBI from 'jsbi';
import { ChainId } from './constants';
import { mainnetTokens, testnetTokens } from "./tokens"
import { Token } from './../entities/token';
import { Percent } from './../entities/fractions/percent';


export const ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

/**
 * Addittional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MAINNET]: [mainnetTokens.usdk, mainnetTokens.okt, mainnetTokens.btcb],
  [ChainId.TESTNET]: [testnetTokens.wokt, testnetTokens.okt, testnetTokens.usdk],
  [ChainId.BNB]: [testnetTokens.wokt, testnetTokens.okt, testnetTokens.usdk],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.MAINNET]: [mainnetTokens.wokt, mainnetTokens.dai, mainnetTokens.usdk, mainnetTokens.usdt],
  [ChainId.TESTNET]: [testnetTokens.wokt, testnetTokens.okt, testnetTokens.usdk],
  [ChainId.BNB]: [testnetTokens.wokt, testnetTokens.okt, testnetTokens.usdk],
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [mainnetTokens.okt, mainnetTokens.wokt],
    [mainnetTokens.usdk, mainnetTokens.usdt],
    [mainnetTokens.dai, mainnetTokens.usdt],
  ],
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much BNB so they end up with <.01
export const MIN_BNB: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 BNB

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

// SDN OFAC addresses
export const BLOCKED_ADDRESSES: string[] = [
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B',
  '0xd882cFc20F52f2599D84b8e8D58C7FB62cfE344b',
  '0x901bb9583b24D97e995513C6778dc6888AB6870e',
  '0xA7e5d5A720f06526557c513402f2e6B5fA20b008',
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91353C',
]

// =======

type AddressToken = { [tokenAddress: string]: Token[] };

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    mainnetTokens.wokt,
    mainnetTokens.okt,
    mainnetTokens.okb,
    mainnetTokens.usdt,
    mainnetTokens.btck,
    mainnetTokens.ethk,
    mainnetTokens.usdk,
  ],
  [ChainId.TESTNET]: [testnetTokens.wokt, testnetTokens.okt, testnetTokens.usdt],
  [ChainId.BNB]: [
    new Token(
      ChainId.BNB,
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      18,
      'WBNB',
      'Wrapped BNB',
      'https://www.binance.com/',
    ),
    new Token(
    ChainId.BNB,
      '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      18,
      'CAKE',
      'PancakeSwap Token',
      'https://pancakeswap.finance/',
    ),
    new Token(
      ChainId.BNB,
      '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      18,
      'BUSD',
      'Binance USD',
      'https://www.paxos.com/busd/',
    ),
    new Token(
      ChainId.BNB,
      '0x55d398326f99059fF775485246999027B3197955',
      18,
      'USDT',
      'Tether USD',
      'https://tether.to/',
    ),
    new Token(
      ChainId.BNB,
      '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      18,
      'BTCB',
      'Binance BTC',
      'https://bitcoin.org/',
    ),
    new Token(
      ChainId.BNB,
      '0x23396cF899Ca06c4472205fC903bDB4de249D6fC',
      18,
      'UST',
      'Wrapped UST Token',
      'https://mirror.finance/',
    ),
    new Token(
      ChainId.BNB,
      '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
      18,
      'ETH',
      'Binance-Peg Ethereum Token',
      'https://ethereum.org/en/',
    ),
    new Token(
      ChainId.BNB,
      '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      18,
      'USDC',
      'Binance-Peg USD Coin',
      'https://www.centre.io/usdc',
    ),
  ],

}

// 扩展定义不同chain配置来支持不同swap询价
export const QUOTE_CONFIG = {
  [ChainId.TESTNET]: {
    chainId: ChainId.TESTNET,
    PAIR_ABI: '',
    CUSTOM_BASES: {} as AddressToken,
    INIT_CODE_HASH:
      '0xe3ae0327539fda6ee87492b9ce166b7419808c231acd1fe54dd3fbf7754704f5',
    FACTORY_ADDRESS: '0x709102921812B3276A65092Fe79eDfc76c4D4AFe',
    MAX_HOPS: 3,
    ADDITIONAL_BASES: {} as AddressToken,
    BASES_TO_CHECK_TRADES_AGAINST: BASES_TO_CHECK_TRADES_AGAINST[ChainId.TESTNET],
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    FEES_NUMERATOR: JSBI.BigInt(998),
    FEES_DENOMINATOR: JSBI.BigInt(1000),
    rpc: 'https://exchainrpc.okex.org',
    multiCallAddress: '0x8C24A85DDB876e8D31e14125e40647761fE532Bf',
  },
  [ChainId.MAINNET]: {
    chainId: ChainId.MAINNET,
    PAIR_ABI: '',
    CUSTOM_BASES: {} as AddressToken ,
    INIT_CODE_HASH:
      '0xe3ae0327539fda6ee87492b9ce166b7419808c231acd1fe54dd3fbf7754704f5',
    FACTORY_ADDRESS: '0x709102921812B3276A65092Fe79eDfc76c4D4AFe',
    MAX_HOPS: 3,
    ADDITIONAL_BASES: {} as AddressToken,
    BASES_TO_CHECK_TRADES_AGAINST: BASES_TO_CHECK_TRADES_AGAINST[ChainId.MAINNET],
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    FEES_NUMERATOR: JSBI.BigInt(998),
    FEES_DENOMINATOR: JSBI.BigInt(1000),
    rpc: 'https://exchainrpc.okex.org',
    multiCallAddress: '0x8C24A85DDB876e8D31e14125e40647761fE532Bf',
  },
  [ChainId.BNB]: {
    chainId: ChainId.BNB,
    PAIR_ABI: '',
    CUSTOM_BASES: {} as AddressToken ,
    INIT_CODE_HASH:
      '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    FACTORY_ADDRESS: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    MAX_HOPS: 3,
    ADDITIONAL_BASES: {} as AddressToken,
    BASES_TO_CHECK_TRADES_AGAINST: BASES_TO_CHECK_TRADES_AGAINST[ChainId.BNB],
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    FEES_NUMERATOR: JSBI.BigInt(9975),
    FEES_DENOMINATOR: JSBI.BigInt(10000),
    rpc: 'https://nodes.pancakeswap.com',
    multiCallAddress: '0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B',
  },
}

export const CURRENT_RPC = 'https://exchainrpc.okex.org';
export const CURRENT_CHAINID = 66;

// multicall合约地址
export const addresses = {
  multiCall: {
    65: '0x8C24A85DDB876e8D31e14125e40647761fE532Bf',
    66: '0x8C24A85DDB876e8D31e14125e40647761fE532Bf',
  },
}


export const DEFAULT_FEE = {
  FEES_NUMERATOR: JSBI.BigInt(9975),
  FEES_DENOMINATOR: JSBI.BigInt(10000),
}