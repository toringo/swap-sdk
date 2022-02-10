import { CURRENT_RPC } from '../config';
import { ethers } from 'ethers'

export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(CURRENT_RPC);
