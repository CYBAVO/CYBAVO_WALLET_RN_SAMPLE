# NumericPinCodeInputView

## NumericPinCodeInputView Introduction

1. Create a `NumericPinCodeInputView` simply

```jsx
<NumericPinCodeInputView
          ref={myRef}
          style={{
            alignSelf: 'center',
            marginTop: 0,
          }}
          maxLength={6}
          keepKey={true}
          hapticFeedback={false}
          horizontalSpacing={18}
          verticalSpacing={4}
          buttonWidth={70}
          buttonHeight={70}
          buttonBorderRadius={36}
          buttonBackgroundColor={theme.colors.background}
          buttonTextColor={theme.colors.pinTextColor}
          buttonTextSize={12}
          backspaceButtonWidth={72}
          backspaceButtonHeight={72}
          backspaceButtonBorderRadius={36}
          backspaceButtonBackgroundColor={theme.colors.background}
          buttonBackgroundColorDisabled={theme.colors.background}
          backspaceButtonTextColor={theme.colors.pinTextColor}
          buttonTextColorDisabled={theme.colors.pinDisplayInactivate}
          backspaceButtonTextColorDisabled={theme.colors.pinDisplayInactivate}
          backspaceButtonTextSize={9}
          backspaceButtonBackgroundColorDisabled={theme.colors.background}
          backspaceButtonBackgroundColorPressed={
            theme.colors.pinPressedBackgroundColor
          }
          buttonBackgroundColorPressed={theme.colors.pinPressedBackgroundColor}
          androidButtonRippleColor={theme.colors.pinPressedBackgroundColor}
          backspaceButtonTextColorPressed={theme.colors.pinPressedTextColor}
          buttonTextColorPressed={theme.colors.pinPressedTextColor}
          disabled={loading}
          onChanged={_inputPinCode}
        />
```
2. Set `onChanged` property

    ```javascript
    const _inputPinCode = length => { ... }

    ...

    <NumericPinCodeInputView
     onChanged={_inputPinCode}
    />
    ```
    ```ts
    interface NumericPinCodeInputViewProps extends PinCodeInputViewProps {
        /**
         * Callback when PIN code changed
        * @param length length of current input
        */
        onChanged?: (length: number) => void
        ...
    }
    ```

3. Get `PinSecret` by `NumericPinCodeInputView.submit()` and pass it to Wallet and Auth API
    ```javascript
    const myRef = useRef(null); 

    ...

    <NumericPinCodeInputView
     ref={myRef}
    />
    
    ...

    const pinSecret = await myRef.current.submit();
    await Wallets.createTransaction(..., pinSecret, ... );
    ```

4. PinSecret will be clear after the Wallet and Auth API are executed.
        If you want to use the same `PinSecret` with multiple API calls,
        Please pass `{ pinSecret: pinSecret, retain: true }` as parameter when calling the API.

    ```ts
    const pinSecret = await myRef.current.submit();
    // retain it to survive setupPinCode()
    await Auth.setupPinCode({ pinSecret, retain: true });
    // since we've retained it, we can pass it to createWallet()
    await Wallets.createWallet(..., pinSecret, ...);
    ```

5. You can also use `NumericPinCodeInputView.clear()` to clear current input

    ```javascript
    const myRef = useRef(null); 
    
    ...

    <NumericPinCodeInputView
     ref={myRef}
    />
    
    ...
    
    myRef.current.clear();
    ```
