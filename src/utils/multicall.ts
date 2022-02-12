import { ethers } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { Interface } from '@ethersproject/abi';

import chunkArray from './chunkArray';
import multiCallAbi from '../abis/multicallAbi.json';

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

// chunk calls so we do not exceed the gas limit
const CALL_CHUNK_SIZE = 500

function isMethodArg(x: unknown): x is MethodArg {
  return ['string', 'number'].indexOf(typeof x) !== -1
}

const INVALID_CALL_STATE: CallState = { valid: false, result: undefined, loading: false, syncing: false, error: false }

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
  multiCallConfig: {
    rpc: string,
    multiCallAddress: string,
  },
  callInputs?: OptionalMethodInputs,
): Promise<CallState[]> {
  const fragment = contractInterface.getFunction(methodName);
  const callData: string | undefined = fragment && isValidMethodArgs(callInputs)
        ? contractInterface.encodeFunctionData(fragment, callInputs)
        : undefined;

  const calldata = addresses.map((address) => {
    return address && callData
      ? [address, callData]
      : null;
  });

  const multiCallData = calldata.filter(call => call !== null);

  const chunkedCalls = chunkArray(multiCallData, CALL_CHUNK_SIZE);

  const simpleRpcProvider = new ethers.providers.JsonRpcProvider(multiCallConfig.rpc);

  const multiCallContract = new ethers.Contract(multiCallConfig.multiCallAddress, multiCallAbi, simpleRpcProvider);

  try {
    const multiCallRes: (string | null)[][] = await Promise.all(
      chunkedCalls.map(async (item) => {
        if(item) {
          const { returnData } = await multiCallContract.aggregate(item);
          return returnData;
        }
        return null;
      })
    )

    const assemblyResults: CallState[] = [];
    const mapResultByAddress: Record<string, CallState> = {};

    // 解析结果
    multiCallRes.forEach((data) => {
      data?.forEach((item) => {
        if(item) {
          try {
            const result = contractInterface.decodeFunctionResult(fragment, item);
            assemblyResults.push({
              valid: true,
              loading: false,
              error: false,
              syncing: false,
              result,
            })
          } catch (error) {
            console.debug('Result data parsing failed', fragment, data)
            assemblyResults.push(INVALID_CALL_STATE)
          }
        } else {
          assemblyResults.push(INVALID_CALL_STATE)
        }
      })
    })

    multiCallData.forEach((callData, index) => {
      if(callData) {
        mapResultByAddress[callData[0]] = assemblyResults[index];
      }
    })

    return calldata.map(call => call ? mapResultByAddress[call[0]] : INVALID_CALL_STATE);
  } catch (error) {
    return [];
  }
}