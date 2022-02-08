import { ChainId } from './config/constants';

import { Interface } from '@ethersproject/abi';
import Web3 from 'web3';

import { Pair } from './entities/pair';
import { Trade } from './entities/trade';
import { CurrencyAmount } from './entities/fractions/currencyAmount';
import { TokenAmount } from './entities/fractions/tokenAmount';
import { abi as IUniswapV2PairABI } from './abis/IUniswapV2Pair.json'

import { Token } from './entities/token';
import { Currency } from './entities/currency';

import isTradeBetter from './utils/trades';
import { wrappedCurrency } from './utils/wrappedCurrency';
import { multipleContractSingleData } from './utils/multicall';
import { QUOTE_CONFIG } from './config';


export function add(a: number, b: number) {
  return a + b;
}

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

interface QuotePrams {
  chainId: ChainId;
  to: Token;
  from: Token;
}

interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

export class Quote{
  chainId: ChainId | undefined;
  constructor(config: QuotePrams) {
    this.chainId = config.chainId;
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
    const [tokenA, tokenB] = this.chainId
    ? [wrappedCurrency(from, this.chainId), wrappedCurrency(to, this.chainId)]
    : [undefined, undefined]

    if (!this.chainId) return {
      bases: [], basePairs: []
    };``

    const { BASES_TO_CHECK_TRADES_AGAINST, ADDITIONAL_BASES } = QUOTE_CONFIG[this.chainId];

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
    const { bases, basePairs } = this.getBasePairs(from, to);
    // console.log('getAllCombinations', { bases, basePairs });
    const { CUSTOM_BASES } = QUOTE_CONFIG[this.chainId || ChainId.MAINNET];
    // TODO chainId
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

    // console.log('allBasePairs', allBasePairs);
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

    // const { FACTORY_ADDRESS, INIT_CODE_HASH } = QUOTE_CONFIG[this.chainId];

    const pairAddresses = tokens.map(([tokenA, tokenB]) => {
      // TODO PairAddress
      return tokenA && tokenB && !tokenA.equals(tokenB) ? Pair.getAddress(tokenA, tokenB) : undefined
    });

    // const web3 = new Web3('https://exchainrpc.okex.org');
    // const pairContract = new web3.eth.Contract(IUniswapV2PairABI, pairAddresses);
    // const pairsReserveContractCall = await pairContract.methods
    //   .getReserves()
    //   .call();

    // console.log('pairsReserveContractCall', pairsReserveContractCall);

    const PAIR_INTERFACE = new Interface(IUniswapV2PairABI);
    const results = await multipleContractSingleData(pairAddresses, PAIR_INTERFACE, 'getReserves');
    const { rpc } = QUOTE_CONFIG[this.chainId || ChainId.MAINNET];
    const web3 = new Web3(rpc);
    // const pairContract = new web3.eth.Contract(IUniswapV2PairABI as any, pairAddresses[0]);

    // const pairsReserveContractCall = await pairContract.methods
    //   .getReserves()
    //   .call();
    const webResults: Result[] = await Promise.all(pairAddresses.map(async (pairAddress) => {
      if(pairAddress) {
        try {
          const pairContract = new web3.eth.Contract(IUniswapV2PairABI as any, pairAddress);
          const pairsReserveContractCall = await pairContract.methods.getReserves().call();
          return pairsReserveContractCall; 
        } catch (error) {
          return null; 
        }
      }
      return null;
    }));
    console.log('webResults===> ', { webResults, results });

    return webResults.map((result, i) => {
      // const { result: reserves, loading } = result
      const tokenA = tokens[i][0]
      const tokenB = tokens[i][1]

      // if (loading) return [PairState.LOADING, null]
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
      if (!result) return [PairState.NOT_EXISTS, null]
      const { reserve0, reserve1 } = result
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [
        PairState.EXISTS,
        new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
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
    const allPairCombinations = this.getAllCombinations(from, to);
    const allPairs = await this.getPairs(allPairCombinations);
    // console.log('getAllCommonPairs', { allPairCombinations, allPairs });

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
    // TODO
    const { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } = QUOTE_CONFIG[this.chainId || ChainId.MAINNET];

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
    // console.log('getTradeExactOut', allowedPairs);
    const singleHopOnly = false;

    const { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } = QUOTE_CONFIG[this.chainId || ChainId.MAINNET];
    
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
}