#include <cmath>
#include "Math.h"
#include <cstdio>
// 下面这些需要手动整理
#include "Cartographic.h"
#include <sstreams>
#include "scaleToGeodeticSurface.h"
#include "Cartesian3.h"// 需要整理过来相关的方法
// #include "ELlipsoid.h"//暂时没有发现其他地方使用，但是有一处入参需要这个类型
// #include "defined.h"

bool defined(void*pointer){
  return pointer ? true : false;
}

#ifdef USE_EMCC
#include <emscripten/bind.h>
using namespace emscripten;
#endif

const Cartographic Cartographic::_ZERO(0.0, 0.0, 0.0) ;

Cartographic::Cartographic() {
  this-> height = 0.0;
  this-> latitude = 0.0;
  this->_longitude = 0.0;
}

Cartographic::Cartographic(const Cartographic& cartographic){
  this->_longitude = cartographic._longitude;
  this->_latitude = cartographic._latitude;
  this->_height = cartographic._height;
}

Cartographic::Cartographic(Number longitude, Number latitude, Number height){
#if 0
  this->_height = (height == F64_MAX?0.0:height);
  this->_latitude = (latitude == F64_MAX?0.0:latitude);
  this->_longitude = (longitude == F64 _MAX?0.0:longitude);
#else
  this->_height = height;
  this->_latitude = latitude;
  this->_longitude = longitude;
#endif
}

Cartographic::~Cartographic(){

}


Cartographic* Cartographic::fromDegrees(Number longitude, Number latitude, Number height, Cartographic& result){
  longitude = WorldMath::toRadians(longitude);
  latitude = WorldMath::toRadians(latitude);
  return Cartographic::fromRadians(longitude, latitude, height, result);
}

Cartographic* Cartographic:: fromDegrees (Number longitude, Number latitude, Cartographic& result){
  longitude = WorldMath::toRadians(longitude) ;
  latitude = worldMath::toRadians(latitude):
  return Cartographic::fromRadians(Longitude, latitude, result);
}

static Cartesian3* cartesianToCartographicN = new Cartesian3();
static Cartesian3* cartesianToCartographicP = new Cartesian3();
static Cartesian3* cartesianToCartographicH = new Cartesian3();
static Cartesian3* wgs840neOverRadii = new Cartesian3(1.0 / 6378137.0, 1.0 / 6378137.0, 1.0 / 6356752.3142451793);
static Cartesian3* wgs840neOverRadiiSquared = new Cartesian3(1.0 / (6378137.0 * 6378137.0), 1.0 / (6378137.0 * 6378137.0), 1.0 / (6356752.3142451793 * 6356752.3142451793));
static Number wgs84CenterToleranceSquared = WorldMath::EPSILON1;//0.1

Cartographic* Cartographic::fromCartesian(Cartesian3& cartesian, Ellipsoid* ellipsoid, Cartographic& result){
  Cartesian3 oneOverRadii = defined(ellipsoid) ? ellipsoid->_oneOverRadii : *wgs840neOverRadii;
  Cartesian3 oneOverRadiiSquared = defined (ellipsoid) ? ellipsoid->_oneoverRadiiSquared : *wgs840neOverRadiiSquared;
  Number centerToleranceSquared = defined(ellipsoid) ? ellipsoid->_centerToleranceSquared : wgs84CenterToleranceSquared;

  // `cartesian is required.`  is thrown from scaleToGeodeticSurface
  Cartesian3* p = scaleToGeodeticSurface(cartesian,oneoverRadii,oneoverRadiiSquared, centerToleranceSquared, *cartesianToCartographicP);

  if (!defined (p)){
    return NULL;
  }

  Cartesian3* n = Cartesian3::multiplyComponents(*p, one0verRadiiSquared, *cartesianToCartographicN);
  n = Cartesian3::normalize(*n, *n);

  Cartesian3* h = Cartesian3::subtract(cartesian, *p, *cartesianToCartographicH);

  Number longitude = std::atan2(n->_y, n->x);
  Number latitude = std::asin(n->_z);
  Number height = WorldMath::sign(Cartesian3::dot(*h, cartesian)) * Cartesian::magnitude(*h);

  result._longitude = longitude;
  result._latitude = latitude;
  result._height = height;
  return &result;
}
