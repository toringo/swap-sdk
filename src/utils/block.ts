import { ethers } from 'ethers';
import { CURRENT_RPC } from '../config';

export async function getBlockNumber() {
  const simpleRpcProvider = new ethers.providers.JsonRpcProvider(CURRENT_RPC);

  const blockNumber = await simpleRpcProvider.getBlockNumber();
  return blockNumber;
}