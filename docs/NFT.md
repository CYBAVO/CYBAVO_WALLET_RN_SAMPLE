# NFT

- Bookmarks
  - [NFT Wallet](#nft-wallet-creation)
  - [NFT Balance](#balance)
  - [Deposit](#deposit)
  - [Withdraw](#withdraw)
  - [Transaction Detail](#transaction-detail)

## NFT Wallet Creation

- Suppose you'd like to receive some NFT tokens with Wallet SDK, but there's no that kind of `Currency` in the currency list, you can add NFT currency by calling `addContractCurrency`.  
If that kind of `Currency` already exists, there's no need to add it again.

```ts
/// [NFT] Add a new token & create first wallet
/// @param currency Currency of desired new wallet
/// @param contractAddress Token address for tokens, i.e. an ERC-20 token wallet maps to an Ethereum wallet
/// @param pinSecret PIN secret retrieved via PinCodeInputView
/// @return Promise<AddContractCurrenciesResult>
///
function addContractCurrency(
            currency: number,
            tokenAddress: string,
            pinSecret: number | PinSecretBearer | string
        ): Promise<AddContractCurrenciesResult>;

/// Batch version of addContractCurrency
function addContractCurrencies(
            currency: Array<{number}>,
            tokenAddress: Array<{string}>,
            pinSecret: number | PinSecretBearer | string,
        ): Promise<AddContractCurrenciesResult>;
```

- How to get a contract address?  
You can find it on blockchain explorer.  
Take CryptoKitties for example, you can find its contract address on Etherscan

  ![img](images/sdk_guideline/nft_etherscan_1.png)

## NFT Wallet List

![img](images/sdk_guideline/nft_wallets.jpg)

- Same way as we mentioned in [Wallet Information](wallets.md#wallet-information)
- Conditions:
  - `Wallet.isPrivate == false` ➜ it is on public chain
  - `tokenAddress != ''` ➜ it is a mapped wallet (NFT wallet is also mapped wallet)
  - `Currency.tokenVersion == 721 || 1155` ➜ it is an NFT wallet

## Balance

Refer to [Balance](wallets.md#getbalances)

```ts
type Balance = {

    tokens: Array<string>;; /** Non-Fungible Token IDs for ERC-721*/

    tokenIdAmount: Array<TokenIdAmount> /** Non-Fungible Token ID and amounts for ERC-1155 */

    ...
}
```

- If ERC-721 (NFT), use `tokens`
- If ERC-1155 (NFT), use `tokenIdAmounts`

- In order to present images, call `getMultipleTokenUri` to get token urls.
  
  ```ts
  /// Get NFT Token URI
  /// @param currency Currency of token to query
  /// @param tokenAddresses Array of token address to query
  /// @param tokenIds Array of token address to query
  /// @return Promise<GetMultipleTokenUriResult>
  ///
  function getMultipleTokenUri(
              currency: number,
              tokenAddresses: Array<{string}>,
              tokenIds: Array<{string}>,
          ): Promise<GetMultipleTokenUriResult>;
  ```

### Error Handling

- For ERC-1155

  ```ts
  /// If ERC-1155 token didn't show in wallet's balance, register token ID manually make them in track
  /// @param walletId walletId Wallet ID
  /// @param tokenIds ERC-1155 token IDs for register
  /// @return Promise<RegisterTokenIdsResult>
  ///
  function registerTokenIds(
              walletId: number,
              tokenIds: Array<{string}>,
          ): Promise<RegisterTokenIdsResult>;
  ```

## Deposit

- Select a wallet address, create a new one if needed.
- Generate QR code
- Present the QR code for deposit.

## Withdraw

- The steps are similar to normal transactions. Refer to [Withdraw](transaction.md#withdraw)
- When `createTransaction`
  - For [EIP-721](https://eips.ethereum.org/EIPS/eip-721) , set parameter `amount = tokenId`
  - For [EIP-1155](https://eips.ethereum.org/EIPS/eip-1155) , set parameter `amount = tokenIdAmount` and `extras['token_id'] = tokenId`

## Transaction Detail

- The steps are similar to normal transactions. Refer to [getHistory](transaction.md#gethistory)
