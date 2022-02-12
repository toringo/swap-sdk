## UniverseSwap SDK
> 用于基于uniswap v2版本的 XXXswap 询价交易。

Forked from the [Uniswap SDK](https://github.com/Uniswap/uniswap-v2-sdk/commit/a88048e9c4198a5bdaea00883ca00c8c8e582605).

Uniswap SDK 文档 [uniswap.org](https://uniswap.org/docs/v2/SDK/getting-started/).

### 安装
> node 版本大于10，使用 yarn。

```sh
git clone https://github.com/toringo/swap-sdk.git
```

```sh
cd swap-sdk/
```

```sh
yarn install
```

### 测试

```sh
yarn test
```

### 使用说明

#### Working
- [x] **基于 BSC 的 [PancakeSwap](https://pancakeswap.finance/swap)** 
- [x] **基于 OEC 的 [CherrySwap](https://www.cherryswap.net/#/swap)** 

#### 询价

输入 from token 数量询价 to token 用 `getTradeExactIn`，反之，输入 to token 数量询价 from token 用 `getTradeExactOut`。
```js
import { Quote, TokenAmount, Token } from 'universeswap-sdk';
const quote = new Quote({
  chainId: 66,
});
const USDT = new Token(
  66,
  '0x382bb369d343125bfb2117af9c149795c6c65c50',
  18,
  'USDT',
  'USDT',
  'https://www.okx.com/'
)
const UNIK = new Token(
  66,
  '0x59d226bb0a4d74274d4354ebb6a0e1a1aa5175b6',
  18,
  'UNIK',
  'UNIK',
  'https://www.okx.com/'
)
// 输入 from token 数量询价 to token
quote.getTradeExactIn(
  new TokenAmount(
    UNIK,
    String(1000000000000000000 * Number(cherryValue))
  ),
  USDT
)
.then(res => {
  console.log(res);
})

// 输入 to token 数量询价 from token 
quote.getTradeExactIn(
  UNIK,
  new TokenAmount(
    USDT,
    String(1000000000000000000 * Number(cherryValue))
  )
)
.then(res => {
  console.log(res);
})
```

#### 交易
...

### 扩展
支持扩展不同链的基于uniswap v2版本的 XXXswap 询价，配置`src/config/index.ts` 下的 `QUOTE_CONFIG` 即可。


