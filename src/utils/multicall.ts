import { BigNumber } from 'bignumber.js';
import { Interface, FunctionFragment } from '@ethersproject/abi';
import { Call, toCallKey } from './actions';
import { getBlockNumber } from './block';

type MethodArg = string | number | BigNumber;
type MethodArgs = Array<MethodArg | MethodArg[]>
type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined> | undefined
export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

interface CallState {
  readonly valid: boolean
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined
  // true if the result has never been fetched
  readonly loading: boolean
  // true if the result is not for the latest block
  readonly syncing: boolean
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean
}

function isMethodArg(x: unknown): x is MethodArg {
  return ['string', 'number'].indexOf(typeof x) !== -1
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}

export async function multipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Interface,
  methodName: string,
  callInputs?: OptionalMethodInputs,
): Promise<CallState[]> {
  // TODO JSON RPC
  const currentBlock = await getBlockNumber('https://exchainrpc.okex.org');
  const fragment = contractInterface.getFunction(methodName);
  const callData: string | undefined = fragment && isValidMethodArgs(callInputs)
        ? contractInterface.encodeFunctionData(fragment, callInputs)
        : undefined;

  console.log('multipleContractSingleData', {currentBlock, fragment, callData});
  const calls = fragment && addresses && addresses.length > 0 && callData
    ? addresses.map<Call | undefined>((address) => {
        return address && callData
          ? {
              address,
              callData,
            }
          : undefined
      })
    : [];

  console.log('multipleContractSingleData calls', {calls});
  const results = callsData(calls);

  console.log('multipleContractSingleData results', {results});

  return results.map((result) => toCallState(result, contractInterface, fragment, currentBlock))
}


interface CallResult {
  readonly valid: boolean
  readonly data: string | undefined
  readonly blockNumber: number | undefined
}
interface CallResults {
  [chainId: number]: {
    [callKey: string]: {
        data?: string;
        blockNumber?: number;
        fetchingBlockNumber?: number;
    };
  };
}

const INVALID_RESULT: CallResult = { valid: false, blockNumber: undefined, data: undefined }


export function callsData(calls: (Call | undefined)[]) {
  // TODO callResults
  const callResults: CallResults  = {};
  // TODO chainId
  const chainId = 66;

  return calls.map<CallResult>((call) => {
    if (!chainId || !call) return INVALID_RESULT

    const result = callResults[chainId]?.[toCallKey(call)]
    console.log('callsData', { result, calls, call });
    let data
    if (result?.data && result?.data !== '0x') {
      // eslint-disable-next-line prefer-destructuring
      data = result.data
    }

    return { valid: true, data, blockNumber: result?.blockNumber }
  })
}

const INVALID_CALL_STATE: CallState = { valid: false, result: undefined, loading: false, syncing: false, error: false }
const LOADING_CALL_STATE: CallState = { valid: true, result: undefined, loading: true, syncing: true, error: false }

export function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined,
): CallState {
  console.log('toCallState', {callResult, contractInterface, fragment, latestBlockNumber});
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 2
  const syncing = (blockNumber ?? 0) < latestBlockNumber
  let result: Result | undefined
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data)
      console.log('toCallState result', {result});
    } catch (error) {
      console.debug('Result data parsing failed', fragment, data)
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result,
    error: !success,
  }
}