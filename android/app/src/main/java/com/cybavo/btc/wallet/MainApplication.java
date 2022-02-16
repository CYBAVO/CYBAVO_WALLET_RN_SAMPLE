package com.cybavo.btc.wallet;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.facebook.FacebookSdk;
import android.app.Application;
import android.content.Context;
import android.os.Handler;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication, PurchasesUpdatedListener {
  BillingClient billingClient;
    private ReactContext mReactContext;
    public ReactContext getReactContext() {
        return mReactContext;
    }
  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
           packages.add(new LineLoginPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
    private void registerReactInstanceEventListener() {
        mReactNativeHost.getReactInstanceManager().addReactInstanceEventListener(mReactInstanceEventListener);
    }
    private void unRegisterReactInstanceEventListener() {
        mReactNativeHost.getReactInstanceManager().removeReactInstanceEventListener(mReactInstanceEventListener);
    }
    String uri;
    public final ReactInstanceManager.ReactInstanceEventListener mReactInstanceEventListener = new ReactInstanceManager.ReactInstanceEventListener() {
      @Override
        public void onReactContextInitialized(ReactContext context) {
            mReactContext = context;
            if(uri != null){
                final Handler handler = new Handler();
                handler.postDelayed((Runnable) () -> {
                    WritableMap params = Arguments.createMap();
                    params.putString("type", "onCreate");
                    params.putString("uri", uri);
                    mReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onWalletConnectUri", params);
                    uri = null;
                }, 5000);
            }
        }
    };
  @Override
  public void onCreate() {
      FacebookSdk.setApplicationId(getString(R.string.facebook_app_id));
      FacebookSdk.sdkInitialize(getApplicationContext());
      super.onCreate();
      SoLoader.init(this, /* native exopackage */ false);
      initializeFlipper(this); // Remove this line if you don't want Flipper enabled

      registerReactInstanceEventListener();
      billingClient = BillingClient.newBuilder(getApplicationContext())
              .setListener(this)
              .enablePendingPurchases()
              .build();
  }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.facebook.flipper.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class).invoke(null, context);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> list) {

    }
}
