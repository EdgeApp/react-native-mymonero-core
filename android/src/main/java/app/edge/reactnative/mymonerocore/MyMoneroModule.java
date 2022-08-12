package app.edge.reactnative.mymonerocore;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.HashMap;
import java.util.Map;

public class MyMoneroModule extends ReactContextBaseJavaModule {
  private native String callMyMoneroJNI(String method, String[] arguments);

  private native String[] getMethodNames();

  static {
    System.loadLibrary("mymonero-jni");
  }

  public MyMoneroModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("methodNames", getMethodNames());
    return constants;
  }

  @Override
  public String getName() {
    return "MyMoneroCore";
  }

  @ReactMethod
  public void callMyMonero(String method, ReadableArray arguments, Promise promise) {
    // Re-package the arguments:
    String[] strings = new String[arguments.size()];
    for (int i = 0; i < arguments.size(); ++i) {
      strings[i] = arguments.getString(i);
    }

    try {
      promise.resolve(callMyMoneroJNI(method, strings));
    } catch (Exception e) {
      promise.reject("MyMoneroError", e);
    }
  }
}
