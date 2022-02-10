import Web3 from 'web3';
import { ethers } from 'ethers';
import { abi as IUniswapV2PairABI } from '../abis/IUniswapV2Pair.json'

export async function getReversesByContract(pairAddresses: (string | undefined)[], RPC_URL: string) {
  const allResults = await Promise.all(pairAddresses.map(async (addr) => {
    if(addr) {
      const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const pairContract = new ethers.Contract(addr as string, IUniswapV2PairABI, simpleRpcProvider);
      try {
        const result = await pairContract.getReserves();
        return result;
      } catch (error) {
        return null;
      }
    }
    return null;
  }));

  return allResults;
}

interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}
export async function getReversesByWeb3(pairAddresses: (string | undefined)[], RPC_URL: string) {
  const webResults: Result[] = await Promise.all(pairAddresses.map(async (pairAddress) => {
      if(pairAddress) {
        try {
          const web3 = new Web3(RPC_URL);
          const pairContract = new web3.eth.Contract(IUniswapV2PairABI as any, pairAddress);
          const pairsReserveContractCall = await pairContract.methods.getReserves().call();
          return pairsReserveContractCall; 
        } catch (error) {
          return null; 
        }
      }
      return null;
    }));

  return webResults;
}