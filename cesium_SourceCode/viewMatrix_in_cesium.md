# How to create a viewMatrix in Cesium ?

```js
  // in Cesium.Camera #201
  /**
   * The amount the camera has to change before the <code>changed</code> event is raised. The value is a percentage in the [0, 1] range.
   * @type {number}
   * @default 0.5
   */
  this.percentageChanged = 0.5;

  this._viewMatrix = new Matrix4();
  this._invViewMatrix = new Matrix4();
  updateViewMatrix(this);
  // ｜
  // ｜
  // V
  // in Cesium.Camera #294
  function updateViewMatrix(camera) {
    Matrix4.computeView(
      camera._position,
      camera._direction,
      camera._up,
      camera._right,
      camera._viewMatrix
    );
    Matrix4.multiply(
      camera._viewMatrix,
      camera._actualInvTransform,
      camera._viewMatrix
    );
    Matrix4.inverseTransformation(camera._viewMatrix, camera._invViewMatrix);
  }
```

### Matrix4.computeView
```js
  // in Cesium.Matrix4 #1011
  /**
   * Computes a Matrix4 instance that transforms from world space to view space.
   *
   * @param {Cartesian3} position The position of the camera.
   * @param {Cartesian3} direction The forward direction.
   * @param {Cartesian3} up The up direction.
   * @param {Cartesian3} right The right direction.
   * @param {Matrix4} result The object in which the result will be stored.
   * @returns {Matrix4} The modified result parameter.
   */
  Matrix4.computeView = function (position, direction, up, right, result) {
    //>>includeStart('debug', pragmas.debug);
    Check.typeOf.object("position", position);
    Check.typeOf.object("direction", direction);
    Check.typeOf.object("up", up);
    Check.typeOf.object("right", right);
    Check.typeOf.object("result", result);
    //>>includeEnd('debug');

    // Cesium 中的矩阵是列主序？还是行主序？？ --- 是列主序。

    // 此时的朝向是Camera所在的坐标系的各个轴的朝向，即能确定CameraMatrix
    // 正常朝向的逆矩阵，原本是0\1\2存储的是x轴, 4\5\6存储的是y轴，8\9\10存储的是z轴，现在转置了（正交矩阵的转置矩阵与逆矩阵相同）
    result[0] = right.x;        // 向右的轴
    result[1] = up.x;           // 向上的轴
    result[2] = -direction.x;   // 反转朝向
    result[3] = 0.0;
    result[4] = right.y;        // 向右的轴
    result[5] = up.y;           // 向上的轴
    result[6] = -direction.y;   // 反转朝向
    result[7] = 0.0;
    result[8] = right.z;        // 向右的轴
    result[9] = up.z;           // 向上的轴
    result[10] = -direction.z;  // 反转朝向
    result[11] = 0.0;

    // 将相机的自身的世界位置转换到相机空间中，因为向量与矩阵相乘首先要变换到相机空间中，然后在相机空间中进行位置做差，目的是将相机位置定位到原点 ----？？？
    result[12] = -Cartesian3.dot(right, position);// -cos0，
    result[13] = -Cartesian3.dot(up, position);
    result[14] = Cartesian3.dot(direction, position);
    result[15] = 1.0;
    return result;
  };
```