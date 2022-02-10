import { ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants'
import { pack, keccak256 } from '@ethersproject/solidity';
import { getCreate2Address } from '@ethersproject/address';

import { Token } from './../entities/token';
import { ChainId } from '../config/constants';
import { CURRENT_CHAINID, addresses } from '../config';

import { Address } from '../config/types';
import { simpleRpcProvider } from './providers';

export const getAddress = (address: Address): string => {
  return address[CURRENT_CHAINID] ? address[CURRENT_CHAINID] : address[ChainId.MAINNET]
}

export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}


// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// account is optional
export function getContract<T extends Contract = Contract>(address: string, ABI: any, signer?: ethers.providers.Provider): T | null {
  if (!address || !ABI) return null;

  if (address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  // console.log('simpleRpcProvider', signer ?? simpleRpcProvider);

  return new Contract(address, ABI, signer ?? simpleRpcProvider as any) as T;
}


export function getPairAddress(tokenA: Token, tokenB: Token, FACTORY_ADDRESS: string, INIT_CODE_HASH: string): string {
  const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] 
  const pairAddress = getCreate2Address(
    FACTORY_ADDRESS,
    keccak256(
      ['bytes'],
      [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]
    ),
    INIT_CODE_HASH
  );

  return pairAddress;
}