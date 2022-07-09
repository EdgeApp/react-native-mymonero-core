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
  jobjectArray arguments
) {
  const std::string methodString = unpackJstring(env, method);

  // Re-package the arguments:
  jsize length = env->GetArrayLength(arguments);
  std::vector<const std::string> strings;
  strings.reserve(length);
  for (jsize i = 0; i < length; ++i) {
    jstring string = (jstring)env->GetObjectArrayElement(arguments, i);
    strings.push_back(unpackJstring(env, string));
  }

  // Find the named method:
  for (int i = 0; i < myMoneroMethodCount; ++i) {
    if (myMoneroMethods[i].name != methodString) continue;

    // Validate the argument count:
    if (strings.size() != myMoneroMethods[i].argc) {
      env->ThrowNew(
        env->FindClass("java/lang/Exception"),
        "mymonero incorrect C++ argument count"
      );
      return nullptr;
    }

    // Call the method, with error handling:
    try {
      const std::string out = myMoneroMethods[i].method(strings);
      return env->NewStringUTF(out.c_str());
    } catch (std::exception e) {
      env->ThrowNew(env->FindClass("java/lang/Exception"), e.what());
      return nullptr;
    } catch (...) {
      env->ThrowNew(
        env->FindClass("java/lang/Exception"),
        "mymonero threw a C++ exception"
      );
      return nullptr;
    }
  }

  env->ThrowNew(
    env->FindClass("java/lang/NoSuchMethodException"),
    ("No mymonero C++ method " + methodString).c_str()
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
