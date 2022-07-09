#ifndef MYMONERO_METHODS_HPP_INCLUDED
#define MYMONERO_METHODS_HPP_INCLUDED

#include <string>
#include <vector>

struct MyMoneroMethod {
  const char *name;
  int argc;
  std::string (*method)(const std::vector<const std::string> &args);
};
extern const MyMoneroMethod myMoneroMethods[];
extern const unsigned myMoneroMethodCount;

#endif
