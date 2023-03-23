// import { Matrix4 } from 'cesium';
// import * as Cesium from 'cesium';

// let Matrix4 = Cesium.Matrix4;
// console.log('%c [ Matrix4 ]-2', 'font-size:13px; background:pink; color:#bf2c9f;', Matrix4)

/*
  入参：
    X ------  绕X轴旋转的度数
    Y ------  绕Y轴旋转的度数
    Z ------  绕Z轴旋转的度数
    unit ---  度数的单位(degree, radian), 默认是 degree
*/
// function rotateAroundAxis({ X, Y, Z, unit = 'degree' }) {
//   // 判断是角度，不是弧度
//   if (unit == 'radian') {
//     X = X * (180/Math.PI);
//     Y = Y * (180/Math.PI);
//     Z = Z * (180/Math.PI);
//   }
//   let M = Matrix4.IDENTITY;
//   if (X>0) {
//     let m = Matrix4.fromArray(rotateAroundXAxis(X));
//     M = Matrix4.multiply(M, m, new Matrix4());
//   }
//   if (Y>0) {
//     let m = Matrix4.fromArray(rotateAroundYAxis(Y));
//     M = Matrix4.multiply(M, m, new Matrix4());
//   }
//   if (Z>0) {
//     let m = Matrix4.fromArray(rotateAroundZAxis(Z));
//     M = Matrix4.multiply(M, m, new Matrix4());
//   }
//   return M;
// }
export function rotateAroundXAxis(a) {
  return [
      1,       0,        0,     0,
      0,  Math.cos(a),  -Math.sin(a),     0,
      0,  Math.sin(a),   Math.cos(a),     0,
      0,       0,        0,     1
  ];
}
export function rotateAroundYAxis(a) {
  return [
      Math.cos(a),   0, Math.sin(a),   0,
          0,   1,      0,   0,
      -Math.sin(a),   0, Math.cos(a),   0,
          0,   0,      0,   1
  ];
}
export function rotateAroundZAxis(a) {
  return [
      Math.cos(a), -Math.sin(a),    0,    0,
      Math.sin(a),  Math.cos(a),    0,    0,
          0,       0,    1,    0,
          0,       0,    0,    1
  ];
}

// let obj = { rotateAroundXAxis, rotateAroundYAxis, rotateAroundZAxis };

// export default rotateAroundAxis
// export default {
//   rotateAroundXAxis,
//   rotateAroundYAxis,
//   rotateAroundZAxis
// }

// export default rotateAroundAxis
