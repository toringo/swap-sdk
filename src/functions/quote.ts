import { ChainId, QUOTE_CONFIG } from './../config/constants/index';
import { Interface } from '@ethersproject/abi'

import isTradeBetter from '../utils/trades';
import { wrappedCurrency } from '../utils/wrappedCurrency';
import { multipleContractSingleData } from '../utils/multicall';
import { Currency, CurrencyAmount, Pair, Token, TokenAmount, Trade } from '../libs';
import IUniswapV2PairABI from '../config/abi/uniswap-v2-pair.json'
// import { ADDITIONAL_BASES, BASES_TO_CHECK_TRADES_AGAINST, BETTER_TRADE_LESS_HOPS_THRESHOLD, CUSTOM_BASES } from '../config/constants';

export function add(a: number, b: number) {
  return a + b;
}

/**
 * getQuote
  getPairReserves
  bestTradeExactIn
  bestTradeExactOut
  getRoute
  minimumAmountOut
  Network Fee
  Price Impact

 */

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

type QuoteParams = typeof QUOTE_CONFIG[ChainId];
interface QuotePrams {
  chainId: ChainId;
  to: Token;
  from: Token;
}

export class Quote {
  to: Token | undefined;
  from: Token | undefined;
  chainId: ChainId = ChainId.TESTNET;
  config: QuoteParams = QUOTE_CONFIG[ChainId.TESTNET];

  constructor(props: QuotePrams) {
    this.init(props);
  }

  init(props: QuotePrams) {
    console.log('props', props);
    const { chainId, from, to } = props;
    this.to = to;
    this.from = from;
    this.chainId = chainId;
    this.config = QUOTE_CONFIG[chainId];
  }

  /**
   * 获取base Token和from Token的组合pair, 中间可交易token两两组合，过滤两两重复的
   * @param {Token} from 输入值
   * @returns Pair[]
   */
  getBasePairs(from?: Currency, to?: Currency): {
    bases: Token[];
    basePairs: [Token, Token][];
  } {
    // TODO chainId
    debugger
    const [tokenA, tokenB] = this.chainId
    ? [wrappedCurrency(from, this.chainId), wrappedCurrency(to, this.chainId)]
    : [undefined, undefined]

    if (!this.chainId) return {
      bases: [], basePairs: []
    };``

    const { BASES_TO_CHECK_TRADES_AGAINST, ADDITIONAL_BASES } = this.config;

    const common = BASES_TO_CHECK_TRADES_AGAINST ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES?.[tokenB.address] ?? [] : []

    const bases: Token[] = [...common, ...additionalA, ...additionalB];

    const basePairs: [Token, Token][] = bases
        .flatMap(base => bases.map(otherBase => [base, otherBase]) as [Token, Token][]);

    return { bases, basePairs };
  }

  /**
   * 合并所有pairs组合，过滤只能通过某些pair兑换的token，过滤掉类似[a, b]和[b,a]重复的pair
   * @returns Pair[]
   */
  getAllCombinations(from?: Currency, to?: Currency): [Token, Token][] {
    debugger
    const { bases, basePairs } = this.getBasePairs(from, to);
    console.log('getAllCombinations', { bases, basePairs });
    const { CUSTOM_BASES } = this.config;
    // TODO chainId
    // const chainId = this.chainId;
    const [tokenA, tokenB] = this.chainId
    ? [wrappedCurrency(from, this.chainId), wrappedCurrency(to, this.chainId)]
    : [undefined, undefined]

    const allBasePairs = tokenA && tokenB ? [
      // the direct pair
      [tokenA, tokenB],
      // token A against all bases
      ...bases.map((base): [Token, Token] => [tokenA, base]),
      // token B against all bases
      ...bases.map((base): [Token, Token] => [tokenB, base]),
      // each base against all bases
      ...basePairs
    ] : [];

    console.log('allBasePairs', allBasePairs);
    return allBasePairs
      .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
      .filter(([t0, t1]) => t0 !== t1)
      .filter(([tokenA_, tokenB_]) => {
          if (!this.chainId) return true

          const customBasesA: Token[] | undefined = CUSTOM_BASES?.[tokenA_.address]
          const customBasesB: Token[] | undefined = CUSTOM_BASES?.[tokenB_.address]

          if (!customBasesA && !customBasesB) return true

          if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false
          if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false

          return true
        });
  }

  /**
   * 根据pairAddress调用合约方法
   * 调用 IUniswapV2PairABI 合约的 getReserves 方法获取pair的balance等信息
   */
  async getPairs(currencies: [Currency | undefined, Currency | undefined][]): Promise<[PairState, Pair | null][]> {
    // TODO chainId
    // const chainId = this.chainId;

    const tokens = currencies.map(([currencyA, currencyB]) => [
      wrappedCurrency(currencyA, this.chainId),
      wrappedCurrency(currencyB, this.chainId),
    ]);

    const { FACTORY_ADDRESS, INIT_CODE_HASH } = this.config;

    const pairAddresses = tokens.map(([tokenA, tokenB]) => {
      return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB, FACTORY_ADDRESS, INIT_CODE_HASH) : undefined
    });

    const PAIR_INTERFACE = new Interface(IUniswapV2PairABI);
    const results = await multipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');

    return results.map((result, i) => {
      const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!reserves) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = reserves
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString()), FACTORY_ADDRESS, INIT_CODE_HASH),
      ]
    })
  }


  /**
   * 获取所有pair组合，作为bestTradeExactIn的输入
   * @param from 
   * @param to 
   * @returns Pair[]
   */
  async getAllCommonPairs(from?: Currency, to?: Currency): Promise<Pair[]> {
    debugger
    const allPairCombinations = this.getAllCombinations(from, to);
    const allPairs = await this.getPairs(allPairCombinations);
    console.log('getAllCommonPairs', { allPairCombinations, allPairs });

    return Object.values(
      allPairs
        // filter out invalid pairs
        .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
        // filter out duplicated pairs
        .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
          memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
          return memo
        }, {}),
    )
  }

  /**
   * 根据 maxHops, allpairs, amountIn, currencyOut 等参数，调用最佳路径方法bestTradeExactIn/bestTradeExactOut
   */
  async getTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): Promise<Trade | null> {
    debugger
    const allowedPairs = await this.getAllCommonPairs(currencyAmountIn?.currency, currencyOut)
    console.log('getTradeExactIn', allowedPairs);
    const singleHopOnly = false;
    const { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } = this.config;

    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      if (singleHopOnly) {
        return (
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ??
          null
        )
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade: Trade | null =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: i, maxNumResults: 1 })[0] ??
          null
        // if current trade is best yet, save it
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return bestTradeSoFar
    }

    return null
  }

    /**
   * 根据 maxHops, allpairs, amountIn, currencyOut 等参数，调用最佳路径方法bestTradeExactIn/bestTradeExactOut
   */
  async getTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): Promise<Trade | null> {
    debugger
    const allowedPairs = await this.getAllCommonPairs(currencyIn, currencyAmountOut?.currency)
    console.log('getTradeExactOut', allowedPairs);
    const singleHopOnly = false;

    const { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } = this.config;
    
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      if (singleHopOnly) {
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ??
          null
        )
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade =
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: i, maxNumResults: 1 })[0] ??
          null
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return bestTradeSoFar
    }
    return null
  }

  getUniswap() {

  }
}