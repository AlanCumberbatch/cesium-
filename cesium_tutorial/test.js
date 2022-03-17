/**
 * Sets the algorithm and degree to use when interpolating a value.
 *
 * @param {Object} [options] Object with the following properties:
 * @param {InterpolationAlgorithm} [options.interpolationAlgorithm]
 *        The new interpolation algorithm.  If undefined, the existing property will be unchanged.
 * @param {Number} [options.interpolationDegree]
 *        The new interpolation degree.  If undefined, the existing property will be unchanged.
 */

SampledProperty.prototype.setInterpolationOptions = function (options) {
  var valuesChanged = false;
  var interpolationAlgorithm = options.interpolationAlgorithm;
  var interpolationDegree = options.interpolationDegree;

  if (defined(interpolationAlgorithm) && this._interpolationAlgorithm !== interpolationAlgorithm ) {
      this._interpolationAlgorithm = interpolationAlgorithm; // 改变当前实例所使用的算法 ---》 而后怎么用了？？： 调取 getRequiredDataPoints 方法 ------》 XTable， YTable，然后执行 方法interpolateOrderZero
      valuesChanged = true;
  }

  if ( defined(interpolationDegree) && this._interpolationDegree !== interpolationDegree ) {
      this._interpolationDegree = interpolationDegree;// 更改 插值度 ---- 这个概念没清楚  ---》 改完之后怎么用的呢？： 作为第一个参数传入 getRequiredDataPoints 方法
      valuesChanged = true;
  }

  if (valuesChanged) {
      this._updateTableLength = true; // 允许在执行 getValuue 方法时
      this._definitionChanged.raiseEvent(this);// 监听暂时没找到在哪里添加得到的
  }
};
