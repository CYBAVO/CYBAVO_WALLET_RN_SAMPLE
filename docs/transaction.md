# Transaction

- Bookmarks
  - [Deposit](#deposit)
  - [Withdraw](#withdraw)
  - [Transaction Detail](#transaction-detail)
  - [Transaction Replacement](#transaction-replacement)
  - [Others](#others)

## Deposit

- Select a wallet address, create a new one if needed.
- Generate QR code
- Present the QR code for deposit.

## Withdraw

![img](images/sdk_guideline/create-transation.jpg)

### getTransactionFee

- To get transaction fees of the selected currency,  
you will get three levels { high, medium, low } of fees for the user to select.
- `tokenAddress` is for private chain usage. For public chain, `tokenAddress` should always be ''
- For example:
  - ETH transaction use ETH as transaction fee ➜ pass `currency: 60, tokenAddress: ''`
  - ERC20 transaction use ETH as transaction fee ➜ pass `currency: 60, tokenAddress: ''`

```ts
/// Get transaction transactionFee of specified currency
/// @param currency Currency to query
/// @param tokenAddress fee of private to public transaction
/// @return Promise<GetTransactionFeeResult>
///
function getTransactionFee(
          currency: number,
          tokenAddress: string
       ): Promise<GetTransactionFeeResult>;
```

### getCurrencyTraits

- To get currency traits when you are ready to withdraw.

```ts
/// Get currency traits for withdraw restriction
/// @param currency query currency
/// @param tokenAddress query tokenAddress
/// @param tokenVersion query tokenVersion
/// @param walletAddress query walletAddress
/// @return Promise<GetCurrencyTraitsResult>
///
function getCurrencyTraits(
          currency: number,
          tokenAddress: string,
          tokenVersion: number,
          walletAddress: string
       ): Promise<GetCurrencyTraitsResult>;
```

- Response: `GetCurrencyTraitsResult`

    ```ts
    type GetCurrencyTraitsResult = {

        ranularity: string; // EPI-777: withdraw must be multiples of granularity

        existentialDeposit: string; // The minimum balance after transaction (ALGO, DOT, KSM)

        minimumAccountBalance: string; // The minimum balance after transaction (XLM, FLOW)
    }
    ```

  - about `granularity`, see [EIP-777](https://eips.ethereum.org/EIPS/eip-777) ➜ search for granularity section
  - about `existentialDeposit`, see [this](https://support.polkadot.network/support/solutions/articles/65000168651-what-is-the-existential-deposit-)

  - about `minimumAccountBalance`, see [this](https://developers.stellar.org/docs/glossary/minimum-balance/)

### estimateTransaction

- Estimate the transaction fees to present for the user.

```ts
/// Estimate platform fee / chain fee for given transaction information
/// @param currency Currency of desired new wallet
/// @param tokenAddress Token address for tokens, i.e. an ERC-20 token wallet maps to an Ethereum wallet
/// @param amount Amount to transfer
/// @param transactionFee Transaction transactionFee to pay
/// @param walletId Wallet ID to estimated transaction
/// @param toAddress To Address
/// @return Promise<EstimateTransactionResult>
///
function estimateTransaction(
          currency: number,
          tokenAddress: string,
          amount: string,
          transactionFee: string,
          walletId?: number,
          toAddress?: string,
       ): Promise<EstimateTransactionResult>;
```

- Response: `EstimateTransactionResult`

    ```ts
    type EstimateTransactionResult = {

        tranasctionAmout: string; // Estimated total amount to transaction

        platformFee: string; // Estimated platform fee of transaction

        blockchainFee: string; // Estimated blockchain fee of transaction

        withdrawMin: string; // Minimum transfer amount for private chain
    }
    ```

  - Administrators can add `platformFee` on admin panel
  ![screenshot](images/sdk_guideline/screenshot_platform_fee_management.png)

### getAddressesTags

- To get an AML tag for the address.
- Be sure to provide warnings for the user if the address is in the blacklist.

```ts
/// Get AML tag for address
/// @param currency query currency
/// @param addresses query address
/// @return Promise<GetAddressesTagsResult>
///
function getAddressesTags(
          currency: number,
          addresses: Array<{string}>,
       ): Promise<GetAddressesTagsResult>;
```

### createTransaction

- This method will create and broadcast a transaction to blockchain.
- Fulfill the requirement of different types of currencies in the extras field.
- Please use the function with `PinSecret` version, the others are planning to deprecate.
- If you are making SMS transaction, refer to `createTransactionSms`
- If you are making Biometrics transaction, refer to `createTransactionBio`

```ts
/// Create a transaction from specified wallet to specified address
/// @param fromWalletId ID of wallet to withdraw from
/// @param toAddress Target address to send
/// @param amount Amount to transfer, token ID for ERC-721, BSC-721
/// @param transactionFee Transaction transactionFee to pay
/// @param description Description of the transaction
/// @param pinSecret: PIN secret retrieved via {PinCodeInputView}
/// @param extraAttributes Extra attributes for specific currencies, pass null if unspecified.
///      - Supported extras:
///         1. memo (String) - Memo for XRP, XML, EOS, BNB
///         2. eos_transaction_type (EosResourceTransactionType) - Resource transaction type for EOS, such as buy RAM, delegate CPU
///         3. num_bytes (Long) - Bytes of RAM/NET for EOS RAM delegation/undelegation transactions. The minimal amounts are 1024 bytes
///         4. input_data (String) - Hex string of input data. Must also set gas_limit when have this attributes
///         5. gas_limit (Long) - Must specify this if there were input_data
///         6. skip_email_notification (Boolean) -Determined whether or not to skip sending notification mail after create a transaction
///         7. token_id (String) -token ID for ERC-1155
///         8. kind (String) -kind for private chain, code: private to private; out: private to public
///         9. to_address_tag (String[]) -AML tag, get from getAddressesTags() API
///      - Note:
///         - When eos_transaction_type is EosResourceTransactionType.SELL_RAM, EosResourceTransactionType.UNDELEGATE_CPU or EosResourceTransactionType.UNDELEGATE_NET, the receiver should be address of Wallet fromWalletId
///         - ex: ["memo": "abcd", "eos_transaction_type": EosResourceTransactionType.SELL_RAM.rawValue, "skip_email_notification": false, "kind": "code"]
///  @return Promise<CreateTransactionResult>
///
function createTransaction(
          fromWalletId: number,
          toAddress: string,
          amount: string,
          transactionFee: string,
          description: string,
          pinSecret?: number | PinSecretBearer | string,
          extraAttributes?: object
      ): Promise<CreateTransactionResult>;
```

## Transaction Detail

### getHistory

- Call this API to get the transaction history.

```ts
/// Get transaction history from
/// @param currency Currency of the address
/// @param tokenAddress Token Contract Address of the address
/// @param walletAddress Wallet address
/// @param start Query start offset
/// @param count Query count returned
/// @param crosschain For private chain transaction history filtering. 0: history for private chain transfer; 1: history for crossing private and public chain
/// @param Filter parameters:
///     - direction {Transaction.Direction} - Direction of transaction
///     - pending {Boolean} - Pending state of transactions
///     - success {Boolean} - Success state of transactions
///     - start_time {Long} - Start of time period to query, in Unix timestamp
///     - end_time {Long} - End of time period to query, in Unix timestamp
///       - ex: ["direction": Direction.OUT, "pending": true, "start_time": 1632387959]
/// @return Promise<GetHistoryResult>
///
function getHistory(
          currency: number,
          tokenAddress: string,
          walletAddress: string,
          start: number,
          count: number,
          filters?: object
       ): Promise<GetHistoryResult>;
```

- Paging query: you can utilize `start` and `count` to fulfill paging query.  
  - For example:
    - pass `start: transactions.count, count: 10` to get 10 more records when it reaches your load more condition until there's no more transactions.
    - Has more: `result.start` + `result.transactions.length` < `result.total`
- Response: list of `Transaction`

    ```ts
    type Transaction = {

        txid: string; // transaction ID

        pending: boolean;

        success: boolean;

        dropped: boolean; // Is transaction dropped by the blockchain

        replaced: boolean; // Is transaction replaced by another transaction
    
        ...
    }
    ```

    <img src="images/sdk_guideline/transaction_state.jpg" alt="drawing" width="600"/>

- If the Tx's final state is `Success` or `Pending`, you could call `getTransactionInfo` to check the information about this Tx on the blockchain.

### getTransactionInfo

- Check the information about the Tx on the blockchain.

```ts
/// Get transaction result for given txid.
/// @param currency currency to get transaction result
/// @param txid txid of transaction
/// @return Promise<GetTransactionInfoResult>
///
function getTransactionInfo(
          currency: number,
          txid: string
       ): Promise<GetTransactionInfoResult>;


/// the batch version of getTransactionInfo
function getTransactionsInfo(
          currency: number,
          txid: string[]
       ): Promise<GetTransactionsInfoResult>;
```

## Transaction Replacement

> ⚠️ Warning: Cancel / Accelerate transactions will incur a higher Tx fee for replacing the original Tx.

- If a user wants to Cancel / Accelerate a `Pending` Tx on blockchain.
The user needs to create another Tx with higher Tx fee and the same nonce to replace the original one.
- You can achive Tx replacement by `cancelTransaction` and `increaseTransactionFee` API.
- Condition: `replaceable == true`

  ```ts
  public final class Transaction {

      txid: string;
      
      replaceable: boolean;// Is transaction replaceable

      replaced: boolean; // Is transaction replaced by another transaction

      replaceTxid: string; // TXID of replacement of this transaction if {@link #replaced} == true

      nonce: number; // Nonce of transaction, only valid on ETH, same nonce means replacements
      
      ...
  }
  ```
  
  - Steps:
    1. Call `getTransactionFee` to get the current Tx fee.
    2. Decide a new Tx fee
        - if (Tx fee > original Tx fee) ➜ use the new Tx fee
        - if (Tx fee <= original Tx fee) ➜ decide a higher Tx fee by your rules
            - Suggestion: In our experience, (original Tx fee) * 1.1 might be a easy way to calculate a new price for doing this operation.
    3. Call `cancelTransaction` for canceling transactions.
    4. Call `increaseTransactionFee` for accelerating transactions.

### Transaction Replacement History

- In the result of `getHistory`, you will need to determine different states for a transaction.
- How to determine a transaction is replaced or not:
    1. filter `platformFee == false` ➜ reduce the transactions which are platform fees.
    2. filter `nonce != 0` ➜ reduce normal transactions
    3. mapping transactions with the same nonce
    4. in a set of transactions:
        - the Tx fee lower one ➜ the original order
        - `if Tx1.amount == Tx2.amount` ➜ is Accelerate transaction operation
        - `if Tx.amount == 0` ➜ is Cancel transaction operation
        - `if Tx1.replaced == false && Tx2.replaced == false` ➜ is operating
        - `if Original-Tx.replaced == true` ➜ Cancel / Accelerate success
        - `if Replacement-Tx.replaced == true` ➜ Cancel / Accelerate failed

## Others

- ABI functions `callAbiFunctionTransaction()`, `callAbiFunctionRead()` see this [Sample](https://github.com/CYBAVO/react-native_wallet_sdk_sample/blob/ef60268619ead205c25c708af0dbc119f2497a3e/screens/WithdrawScreen.js)
