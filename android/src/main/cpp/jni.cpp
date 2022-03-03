#include "mymonero-wrapper/mymonero-methods.hpp"

#include <jni.h>
#include <cstring>

static const std::string unpackJstring(JNIEnv *env, jstring s) {
  const char *p = env->GetStringUTFChars(s, 0);
  const std::string out(p);
  env->ReleaseStringUTFChars(s, p);
  return out;
}

extern "C" {

JNIEXPORT jstring JNICALL
Java_app_edge_reactnative_mymonerocore_MyMoneroModule_callMyMoneroJNI(
  JNIEnv *env,
  jobject self,
  jstring method,
  jstring arguments
) {
  const std::string methodString = unpackJstring(env, method);
  const std::string argumentsString = unpackJstring(env, arguments);

  // Find the named method:
  for (int i = 0; i < myMoneroMethodCount; ++i) {
    if (myMoneroMethods[i].name != methodString) continue;

    // Call the method, with error handling:
    try {
      const std::string out = myMoneroMethods[i].method(argumentsString);
      return env->NewStringUTF(out.c_str());
    } catch (...) {
      env->ThrowNew(
        env->FindClass("java/lang/Exception"),
        "mymonero-core-cpp threw an exception"
      );
      return nullptr;
    }
  }

  env->ThrowNew(
    env->FindClass("java/lang/NoSuchMethodException"),
    ("No mymonero-core-cpp method " + methodString).c_str()
  );
  return nullptr;
}

JNIEXPORT jobjectArray JNICALL
Java_app_edge_reactnative_mymonerocore_MyMoneroModule_getMethodNames(
  JNIEnv *env,
  jobject self
) {
  jobjectArray out = env->NewObjectArray(
    myMoneroMethodCount,
    env->FindClass("java/lang/String"),
    env->NewStringUTF("")
  );
  if (!out) return nullptr;

  for (int i = 0; i < myMoneroMethodCount; ++i) {
    jstring name = env->NewStringUTF(myMoneroMethods[i].name);
    env->SetObjectArrayElement(out, i, name);
  }
  return out;
}

}
