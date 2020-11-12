#ifndef METHODS_HPP_INCLUDED
#define METHODS_HPP_INCLUDED

#include <string>

struct MyMoneroMethod {
    const char *name;
    std::string (*method)(const std::string &args);
};
extern const MyMoneroMethod myMoneroMethods[];
extern const unsigned myMoneroMethodCount;

#endif