import { ethers } from 'ethers';

export async function getBlockNumber(rpcUrl: string) {
  const simpleRpcProvider = new ethers.providers.StaticJsonRpcProvider(rpcUrl);
  const blockNumber = await simpleRpcProvider.getBlockNumber();
  return blockNumber;
}