var factorials = [1];

  /**
   * Computes the factorial of the provided number.
   *
   * @param {Number} n The number whose factorial is to be computed.
   * @returns {Number} The factorial of the provided number or undefined if the number is less than 0.
   *
   * @exception {DeveloperError} A number greater than or equal to 0 is required.
   *
   *
   * @example
   * //Compute 7!, which is equal to 5040
   * var computedFactorial = Cesium.Math.factorial(7);
   *
   * @see {@link http://en.wikipedia.org/wiki/Factorial|Factorial on Wikipedia}
   */
  factorial = function (n) {
    //>>includeStart('debug', pragmas.debug);
    if (typeof n !== "number" || n < 0) {
      throw new DeveloperError(
        "A number greater than or equal to 0 is required."
      );
    }
    //>>includeEnd('debug');

    var length = factorials.length;
    if (n >= length) {
      var sum = factorials[length - 1];
      for (var i = length; i <= n; i++) {
        var next = sum * i;
        factorials.push(next);
        sum = next;
      }
    }
    return factorials[n];
  };
export default factorial;