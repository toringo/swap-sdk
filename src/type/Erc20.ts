// /* Autogenerated file. Do not edit manually. */
// /* tslint:disable */
// /* eslint-disable */
// import {
//   BaseContract,
//   BigNumber,
//   BigNumberish,
//   BytesLike,
//   CallOverrides,
//   ContractTransaction,
//   Overrides,
//   Signer,
//   utils,
// } from "ethers";
// import { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
// import { Listener, Provider } from "@ethersproject/providers";
// import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

// export type ApprovalEvent = TypedEvent<
//   [string, string, BigNumber],
//   { owner: string; spender: string; value: BigNumber }
// >;

// export type ApprovalEventFilter = TypedEventFilter<ApprovalEvent>;

// export type TransferEvent = TypedEvent<
//   [string, string, BigNumber],
//   { from: string; to: string; value: BigNumber }
// >;

// export type TransferEventFilter = TypedEventFilter<TransferEvent>;

// export interface Erc20 extends BaseContract {
//   connect(signerOrProvider: Signer | Provider | string): this;
//   attach(addressOrName: string): this;
//   deployed(): Promise<this>;

//   interface: Erc20Interface;

//   queryFilter<TEvent extends TypedEvent>(
//     event: TypedEventFilter<TEvent>,
//     fromBlockOrBlockhash?: string | number | undefined,
//     toBlock?: string | number | undefined
//   ): Promise<Array<TEvent>>;

//   listeners<TEvent extends TypedEvent>(
//     eventFilter?: TypedEventFilter<TEvent>
//   ): Array<TypedListener<TEvent>>;
//   listeners(eventName?: string): Array<Listener>;
//   removeAllListeners<TEvent extends TypedEvent>(
//     eventFilter: TypedEventFilter<TEvent>
//   ): this;
//   removeAllListeners(eventName?: string): this;
//   off: OnEvent<this>;
//   on: OnEvent<this>;
//   once: OnEvent<this>;
//   removeListener: OnEvent<this>;

//   functions: {
//     name(overrides?: CallOverrides): Promise<[string]>;

//     approve(
//       _spender: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<ContractTransaction>;

//     totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

//     transferFrom(
//       _from: string,
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<ContractTransaction>;

//     decimals(overrides?: CallOverrides): Promise<[number]>;

//     balanceOf(
//       _owner: string,
//       overrides?: CallOverrides
//     ): Promise<[BigNumber] & { balance: BigNumber }>;

//     symbol(overrides?: CallOverrides): Promise<[string]>;

//     transfer(
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<ContractTransaction>;

//     allowance(
//       _owner: string,
//       _spender: string,
//       overrides?: CallOverrides
//     ): Promise<[BigNumber]>;
//   };

//   name(overrides?: CallOverrides): Promise<string>;

//   approve(
//     _spender: string,
//     _value: BigNumberish,
//     overrides?: Overrides & { from?: string | Promise<string> }
//   ): Promise<ContractTransaction>;

//   totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

//   transferFrom(
//     _from: string,
//     _to: string,
//     _value: BigNumberish,
//     overrides?: Overrides & { from?: string | Promise<string> }
//   ): Promise<ContractTransaction>;

//   decimals(overrides?: CallOverrides): Promise<number>;

//   balanceOf(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

//   symbol(overrides?: CallOverrides): Promise<string>;

//   transfer(
//     _to: string,
//     _value: BigNumberish,
//     overrides?: Overrides & { from?: string | Promise<string> }
//   ): Promise<ContractTransaction>;

//   allowance(
//     _owner: string,
//     _spender: string,
//     overrides?: CallOverrides
//   ): Promise<BigNumber>;

//   callStatic: {
//     name(overrides?: CallOverrides): Promise<string>;

//     approve(
//       _spender: string,
//       _value: BigNumberish,
//       overrides?: CallOverrides
//     ): Promise<boolean>;

//     totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

//     transferFrom(
//       _from: string,
//       _to: string,
//       _value: BigNumberish,
//       overrides?: CallOverrides
//     ): Promise<boolean>;

//     decimals(overrides?: CallOverrides): Promise<number>;

//     balanceOf(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

//     symbol(overrides?: CallOverrides): Promise<string>;

//     transfer(
//       _to: string,
//       _value: BigNumberish,
//       overrides?: CallOverrides
//     ): Promise<boolean>;

//     allowance(
//       _owner: string,
//       _spender: string,
//       overrides?: CallOverrides
//     ): Promise<BigNumber>;
//   };

//   filters: {
//     "Approval(address,address,uint256)"(
//       owner?: string | null,
//       spender?: string | null,
//       value?: null
//     ): ApprovalEventFilter;
//     Approval(
//       owner?: string | null,
//       spender?: string | null,
//       value?: null
//     ): ApprovalEventFilter;

//     "Transfer(address,address,uint256)"(
//       from?: string | null,
//       to?: string | null,
//       value?: null
//     ): TransferEventFilter;
//     Transfer(
//       from?: string | null,
//       to?: string | null,
//       value?: null
//     ): TransferEventFilter;
//   };

//   estimateGas: {
//     name(overrides?: CallOverrides): Promise<BigNumber>;

//     approve(
//       _spender: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<BigNumber>;

//     totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

//     transferFrom(
//       _from: string,
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<BigNumber>;

//     decimals(overrides?: CallOverrides): Promise<BigNumber>;

//     balanceOf(_owner: string, overrides?: CallOverrides): Promise<BigNumber>;

//     symbol(overrides?: CallOverrides): Promise<BigNumber>;

//     transfer(
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<BigNumber>;

//     allowance(
//       _owner: string,
//       _spender: string,
//       overrides?: CallOverrides
//     ): Promise<BigNumber>;
//   };

//   populateTransaction: {
//     name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

//     approve(
//       _spender: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<PopulatedTransaction>;

//     totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

//     transferFrom(
//       _from: string,
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<PopulatedTransaction>;

//     decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

//     balanceOf(
//       _owner: string,
//       overrides?: CallOverrides
//     ): Promise<PopulatedTransaction>;

//     symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;

//     transfer(
//       _to: string,
//       _value: BigNumberish,
//       overrides?: Overrides & { from?: string | Promise<string> }
//     ): Promise<PopulatedTransaction>;

//     allowance(
//       _owner: string,
//       _spender: string,
//       overrides?: CallOverrides
//     ): Promise<PopulatedTransaction>;
//   };
// }
