# How to create a Frustum in Cesium ?

There is a Cesium.PerspectiveFrustum exist.</br>
Aming to define a Perspective Frustum in Cesium..</br>

```js
  // in Cesium.Camera #137
  /**
   * The region of space in view.
   *
   * @type {PerspectiveFrustum|PerspectiveOffCenterFrustum|OrthographicFrustum}
   * @default PerspectiveFrustum()
   *
   * @see PerspectiveFrustum
   * @see PerspectiveOffCenterFrustum
   * @see OrthographicFrustum
   */
  this.frustum = new PerspectiveFrustum();
  this.frustum.aspectRatio = scene.drawingBufferWidth / scene.drawingBufferHeight;
  this.frustum.fov = CesiumMath.toRadians(60.0);
```

# How a Frustum defines the projection Matrix in Cesium ?
```js
  // in Cesium.PerspectiveFrustum #231
  /**
   * Gets the perspective projection matrix computed from the view frustum.
   * @memberof PerspectiveFrustum.prototype
   * @type {Matrix4}
   * @readonly
   *
   * @see PerspectiveFrustum#infiniteProjectionMatrix
  */
  Object.defineProperties(PerspectiveFrustum.prototype, {
    /**
     * Gets the perspective projection matrix computed from the view frustum.
     * @memberof PerspectiveFrustum.prototype
     * @type {Matrix4}
     * @readonly
     *
     * @see PerspectiveFrustum#infiniteProjectionMatrix
     */
    projectionMatrix: {
      get: function () {
        update(this);
        return this._offCenterFrustum.projectionMatrix;
      },
    },

    ...

  }

  // #38
  this._offCenterFrustum = new PerspectiveOffCenterFrustum();
```
```js
  // in Cesium.PerspectiveOffCenterFrustum #169
  Object.defineProperties(PerspectiveOffCenterFrustum.prototype, {
    /**
     * Gets the perspective projection matrix computed from the view frustum.
     * @memberof PerspectiveOffCenterFrustum.prototype
     * @type {Matrix4}
     * @readonly
     *
     * @see PerspectiveOffCenterFrustum#infiniteProjectionMatrix
     */
    projectionMatrix: {
      get: function () {
        update(this);
        return this._perspectiveMatrix;
      },
    },

    ...

  }
  // #133
  frustum._left = l;
  frustum._right = r;
  frustum._top = t;
  frustum._bottom = b;
  frustum._near = n;
  frustum._far = f;
  frustum._perspectiveMatrix = Matrix4.computePerspectiveOffCenter(
    l,
    r,
    b,
    t,
    n,
    f,
    frustum._perspectiveMatrix //  this._perspectiveMatrix = new Matrix4();
  );
```
```js
  // in Cesium.Matrix4 #843
  /**
   * Computes a Matrix4 instance representing an off center perspective transformation.
   *
   * @param {Number} left The number of meters to the left of the camera that will be in view.
   * @param {Number} right The number of meters to the right of the camera that will be in view.
   * @param {Number} bottom The number of meters below of the camera that will be in view.
   * @param {Number} top The number of meters above of the camera that will be in view.
   * @param {Number} near The distance to the near plane in meters.
   * @param {Number} far The distance to the far plane in meters.
   * @param {Matrix4} result The object in which the result will be stored.
   * @returns {Matrix4} The modified result parameter.
   */
  Matrix4.computePerspectiveOffCenter = function (
    left,
    right,
    bottom,
    top,
    near,
    far,
    result
  ) {
    //>>includeStart('debug', pragmas.debug);
    Check.typeOf.number("left", left);
    Check.typeOf.number("right", right);
    Check.typeOf.number("bottom", bottom);
    Check.typeOf.number("top", top);
    Check.typeOf.number("near", near);
    Check.typeOf.number("far", far);
    Check.typeOf.object("result", result);
    //>>includeEnd('debug');

    var column0Row0 = (2.0 * near) / (right - left);
    var column1Row1 = (2.0 * near) / (top - bottom);
    var column2Row0 = (right + left) / (right - left);
    var column2Row1 = (top + bottom) / (top - bottom);
    var column2Row2 = -(far + near) / (far - near);
    var column2Row3 = -1.0;
    var column3Row2 = (-2.0 * far * near) / (far - near);

    result[0] = column0Row0;
    result[1] = 0.0;
    result[2] = 0.0;
    result[3] = 0.0;
    result[4] = 0.0;
    result[5] = column1Row1;
    result[6] = 0.0;
    result[7] = 0.0;
    result[8] = column2Row0;
    result[9] = column2Row1;
    result[10] = column2Row2;
    result[11] = column2Row3;
    result[12] = 0.0;
    result[13] = 0.0;
    result[14] = column3Row2;
    result[15] = 0.0;
    return result;
  };
```


了解了之后可以试试阅读  Camera.getPickRayPerspective#2846