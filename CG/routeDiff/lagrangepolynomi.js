import defined from "./defined.js";

/**
 * An {@link InterpolationAlgorithm} for performing Lagrange interpolation.
 *
 * @namespace LagrangePolynomialApproximation
 */
var LagrangePolynomialApproximation = {
  type: "Lagrange",
};

/**
 * Given the desired degree, returns the number of data points required for interpolation.
 *
 * @param {Number} degree The desired degree of interpolation.
 * @returns {Number} The number of required data points needed for the desired degree of interpolation.
 */
LagrangePolynomialApproximation.getRequiredDataPoints = function (degree) {
  return Math.max(degree + 1.0, 2);
};

/**
 * Interpolates values using Lagrange Polynomial Approximation.
 *
 * @param {Number} x The independent variable for which the dependent variables will be interpolated.
 * @param {Number[]} xTable The array of independent variables to use to interpolate.  The values
 * in this array must be in increasing order and the same value must not occur twice in the array.
 * @param {Number[]} yTable The array of dependent variables to use to interpolate.  For a set of three
 * dependent values (p,q,w) at time 1 and time 2 this should be as follows: {p1, q1, w1, p2, q2, w2}.
 * @param {Number} yStride The number of dependent variable values in yTable corresponding to
 * each independent variable value in xTable.
 * @param {Number[]} [result] An existing array into which to store the result.
 * @returns {Number[]} The array of interpolated values, or the result parameter if one was provided.
 */
LagrangePolynomialApproximation.interpolateOrderZero = function (
  x,
  xTable,
  yTable,
  yStride,
  result
) {
  if (!defined(result)) {
    result = new Array(yStride);
  }

  var i;
  var j;
  var length = xTable.length;

  for (i = 0; i < yStride; i++) {
    result[i] = 0;
  }

  for (i = 0; i < length; i++) {
    var coefficient = 1;

    for (j = 0; j < length; j++) {
      if (j !== i) {
        var diffX = xTable[i] - xTable[j];
        coefficient *= (x - xTable[j]) / diffX;
      }
    }

    for (j = 0; j < yStride; j++) {
      result[j] += coefficient * yTable[i * yStride + j];
    }
  }

  return result;
};

// 案例
var x = -67.72600000043167;
var xTable = [
  -225.0,
  -180.0,
  -135.0,
  -90.0,
  -45.0,
  -0.0
];
var yTable = [
  -1944814.3726146347,
  -4779323.961685797,
  3740297.3814439983,
  -1946353.4244015086,
  -4779956.238836014,
  3738233.3529754514,
  -1945750.717271222,
  -4781652.001063456,
  3736280.714354399,
  -1943370.2943612777,
  -4783382.7269118745,
  3735607.1109777773,
  -1940506.515172479,
  -4783950.993914748,
  3736412.6206093826,
  -1938934.0602408552,
  -4783233.073741037,
  3738410.7113252394
];
var yStride = 3;
var result = [];

LagrangePolynomialApproximation.interpolateOrderZero(
	x,
	xTable,
	yTable,
	yStride,
	result
);

for (var i = 0; i < result.length; i++){
  console.log(`result的第 ${i} 个元素的值是:  ${result[i]}`);
}
