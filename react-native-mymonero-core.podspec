require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.authors      = package['author']

  s.platform     = :ios, "9.0"
  s.requires_arc = true
  s.source = {
    :git => "https://github.com/EdgeApp/react-native-mymonero-core.git",
    :tag => "v#{s.version}"
  }
  s.source_files =
    "ios/MyMoneroCore.h",
    "ios/MyMoneroCore.mm",
    "src/mymonero-wrapper/mymonero-methods.hpp"
  s.vendored_libraries = "ios/Libraries/libmymonero-core.a"

  s.dependency "React"
end
