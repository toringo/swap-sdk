import { BigNumber } from 'bignumber.js';
import { Contract } from '@ethersproject/contracts';
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
  // debugger
  // TODO JSON RPC
  const currentBlock = await getBlockNumber();
  console.log('currentBlock', currentBlock);
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

  const results = callsData(calls);

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
  // const RPC_URL = 'https://exchainrpc.okex.org';
  // const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // const signer = simpleRpcProvider.getSigner('0x81Fc6F6E44a2313743bCAA060681d24597aDbDfB')
  // const multicallContract = new ethers.Contract('0x8C24A85DDB876e8D31e14125e40647761fE532Bf', multiCallAbi, signer);

  // const multicallContract = new Contract('0x8C24A85DDB876e8D31e14125e40647761fE532Bf', multiCallAbi, simpleRpcProvider as any);
  // signer.unlock('8a3b93c174cdb42bdf78db2931ec8b380cbaf8fc3e1fdbc9da3c5464c449bb8b');
  // const callsFilter = calls.filter(item => item).map((call) => ({target: call?.address, callData: call?.callData}));
  // console.log('multicallContract====>', {calls, currentBlock, multicallContract, signer, callsFilter});
  // multicallContract.aggregate(
  //   callsFilter,
  //   // [{target: "0x05faf555522Fa3F93959F86B41A3808666093210", callData: "0x0902f1ac" }]
  //   // { blockTag: currentBlock }
  // ).then((res: any) => {
  //   console.log('multicallContract====> then', res);
  // }).catch((err: any) => {
  //   console.log('multicallContract====> err', err);
  // })
  // TODO callResults
  const callResults: CallResults  = {};
  // TODO chainId
  const chainId = 66;

  return calls.map<CallResult>((call) => {
    if (!chainId || !call) return INVALID_RESULT

    const result = callResults[chainId]?.[toCallKey(call)]
    // console.log('callsData', { result, calls, call });
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
      // console.log('toCallState result', {result});
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

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number
}
export async function singleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: OptionalMethodInputs,
  // options?: ListenerOptions,
): Promise<CallState> {
  const fragment = contract?.interface?.getFunction(methodName);

  const calls = contract && fragment && isValidMethodArgs(inputs)
    ? [
        {
          address: contract.address,
          callData: contract.interface.encodeFunctionData(fragment, inputs),
        },
      ]
    : []

  const currentBlock = await getBlockNumber();
  const result = callsData(calls)[0]

  return toCallState(result, contract?.interface, fragment, currentBlock);
}
