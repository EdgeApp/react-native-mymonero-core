package app.edge.reactnative.mymonerocore;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MyMoneroModule extends ReactContextBaseJavaModule {
  private native String callMyMoneroJNI(String method, String arguments);

  static {
    System.loadLibrary("mymonero-jni");
  }

  public MyMoneroModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "MyMoneroCore";
  }

  @ReactMethod
  public void callMyMonero(String method, String arguments, Promise promise) {
    try {
      promise.resolve(callMyMoneroJNI(method, arguments));
    } catch (Exception e) {
      promise.reject("MyMoneroError", e);
    }
  }
}
