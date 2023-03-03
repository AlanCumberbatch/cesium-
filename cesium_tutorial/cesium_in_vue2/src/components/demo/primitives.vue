<template>
  <!-- 用 Cesium.Primitive 创建图元 -->
  <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
// import { Script } from "vm";
import StaticPrimitiveModel from  "../../utils/primitive/StaticPrimitiveModel.js";
// import "./css/main.css";
import preventCameraIntoUnderground from "../../utils/preventCameraIntoUnderground.js";
import showAxis from "../../utils/showAxis.js";
import rotateAroundAxis from "../../utils/rotateAroundAxis.js";

export default {
  name: "CesiumViewer",
  data() {
    return {
      viewer: null,
    };
  },
  mounted() {
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    // const viewer = new Cesium.Viewer('cesiumContainer', {
    //   terrainProvider: Cesium.createWorldTerrain()
    // });
    let viewer = new Cesium.Viewer("cesiumContainer", {
      shouldAnimate: true, //有动画
      // animation: false, //动画控制不显示
      timeline: false, //时间线不显示
      // fullscreenButton: false, //全屏按钮不显示
      infoBox: false,
      // selectionIndicator: true,
      contextOptions: {
        requestWebgl2: true,
      },
    });
    this.viewer = viewer;



    preventCameraIntoUnderground(viewer);

    // Basic Primitive
    this.allBasicPrimitives();
    // this.cylinderPrimitive();
    // let wholeModel = new StaticPrimitiveModel(viewer, {
    //   name:'AAA',
    //   position: new Cesium.Cartesian3.fromDegrees( -107.0, 27.0),
    // })
    // console.log('%c [ wholeModel ]-46', 'font-size:13px; background:pink; color:#bf2c9f;', wholeModel)
    //  -- Ellipsoid
    // this.EllipsoidPrimitive();
    // this.EllipsoidPrimitiveFromVersion1_3DOutline();
    // this.EllipsoidPrimitiveFromVersion1_3DFill();
    // this.EllipsoidPrimitiveFromVersion1_3DFill_ByRectangle();

    // 自定义 Primitive, customer Primitive
    //可以通过 自定义Primitive 创建 2个三角形 --- 理论上(尝试了，不行。。。个人觉得耗性能是主要原因)：在这个模型的基础上，如果可以动态创建多个三角形，并控制三角形的数量，即可以生成 tail --- 但是性能。。。，好像是不咋好，毕竟是多个primitive，那 PrimitiveCollection ？
    // this.custom2Triangle()
    // this.customPlane()
    // this.customBox()
    // this.customRadar();// in DrawCommandTry.vue
    // this.customPlane_useCartesian()

    // Math Function
    // 1. Curve By Bezier
    // this.CurveByBezier();
    // this.pointRotateAroundPoint();// 一个点绕另外一个点旋转的方法。: no need for now, can create in clip space then transform to WGS84

  },
  methods: {
    translatePointAlongAxis(pos, distances = { x: 0, y: 500, z: 0 }) {
      //平移：
      const frompoint_to_world_matrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(pos); // Matrix4
      // const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米
      const local_translation = new Cesium.Cartesian3(
        distances.x,
        distances.y,
        distances.z
      );
      const result = Cesium.Matrix4.multiplyByPoint(
        frompoint_to_world_matrix,
        local_translation,
        new Cesium.Cartesian3(0, 0, 0)
      ); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
      const targetpoint_to_world_matrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(result);

      const world_translation = new Cesium.Cartesian3(
        targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
        targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
        targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14]
      ); // 向量相减，得到世界坐标下的平移向量

      let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

      // 最终的矩阵
      let target_pos = Cesium.Matrix4.multiplyByPoint(
        transitionMatrix,
        pos,
        new Cesium.Cartesian3()
      );

      return target_pos;
    },

    point() {
      var points = scene.primitives.add(new Cesium.PointPrimitiveCollection());
      points.add({
        position: new Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
        color: Cesium.Color.YELLOW,
      });
      points.add({
        position: new Cesium.Cartesian3.fromDegrees(-75.69777, 40.03883),
        color: Cesium.Color.CYAN,
      });
      // console.log("points", points);
      console.log("points._pointPrimitives", points._pointPrimitives);
      /*
      每个点都有自己的 position， 整个 PointPrimitiveCollection 有一个自己的 Matrix4
    */
    },

    custom2Triangle() {
      var viewer = this.viewer;
      let coords = [
        [112.47, 25.694, 200000],
        [109.961, 19.862, 200000],
        [118.122, 21.921, 200000],
        [109.961, 19.862, 200000],
        [118.122, 21.921, 200000],
        [115.613, 16.089, 200000],
      ];
      let colors = [
        255, 10, 10, 123, 10, 255, 10, 123, 10, 10, 255, 123, 10, 255, 10, 123,
        10, 10, 255, 123, 255, 10, 10, 123,
      ];
      /*
        + Primitive
            - GeometryInstance | GeometryInstance[]
                - Geometry
                    - GeometryAttributes
                        - GeometryAttribute
            - Appearance
    */
      //  Primitive API 直到传递给 WebGL 之前，想要在地球上绘制正确，必须是世界坐标。

      const vsSource = `
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;
    attribute vec4 color;
    varying vec4 v_color;
    varying float batchId;

    void main() {
        vec4 position = czm_modelViewProjectionRelativeToEye * czm_computePosition();
        float r = color.r / 255.0;
        float g = color.g / 255.0;
        float b = color.b / 255.0;
        float a = color.a / 255.0;

        v_color = vec4(r, g, b, a);
        gl_Position = position;
    }`;
      const fsSource = `
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color;
    }`;

      /* 计算顶点坐标 */
      // if (!coords ||  coords.length%3 > 0) {
      //     coords = [
      //         [112.470, 25.694, 200000],
      //         [109.961, 19.862, 200000],
      //         [118.122, 21.921, 200000],
      //         [109.961, 19.862, 200000],
      //         [118.122, 21.921, 200000],
      //         [115.613, 16.089, 200000]
      //     ]
      // } else {
      //     if (colors) {
      //         let colors = [
      //             255, 10, 10, 123,
      //             10, 255, 10, 123,
      //             10, 10, 255, 123,
      //             10, 255, 10, 123,
      //             10, 10, 255, 123,
      //             255, 10, 10, 123,
      //         ]
      //     }
      // }
      const coords_world = coords.map((coord) => {
        const cart = Cesium.Cartesian3.fromDegrees(...coord);
        return [cart.x, cart.y, cart.z];
      });
      const coords_vbo = new Float64Array(coords_world.flat());
      /* 结束计算顶点坐标 */

      /* 装配并创建 Primitive */
      const geometry = new Cesium.Geometry({
        attributes: {
          position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: coords_vbo,
          }),
          color: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.UNSIGNED_BYTE,
            componentsPerAttribute: 4,
            values: new Uint8Array(colors),
          }),
        },
        boundingSphere: Cesium.BoundingSphere.fromVertices(coords_world.flat()),
      });
      const instance = new Cesium.GeometryInstance({
        geometry: geometry,
        id: "aaa",
      });
      /* 使用着色器代码及专属于此 primitive 的渲染状态创建自定义外观 */
      const customAppearance = new Cesium.Appearance({
        renderState: {
          depthMask: true,
          blending: Cesium.BlendingState.PRE_MULTIPLIED_ALPHA_BLEND,
          depthTest: {
            enabled: true,
          },
        },
        vertexShaderSource: vsSource,
        fragmentShaderSource: fsSource,
      });
      const primitive = new Cesium.Primitive({
        geometryInstances: [instance],
        releaseGeometryInstances: false,
        compressVertices: false,
        appearance: customAppearance,
        asynchronous: false,
      });
      console.log("customPrimitive----primitive", primitive);
      primitive.readyPromise.then((res) => {
        console.log("over");
      });
      /* 装配结束 */

      viewer.scene.primitives.add(primitive);

      /* 定位 */
      viewer.camera.setView({
        destination: new Cesium.Cartesian3(-5079092, 11300083, 4872035),
        orientation: {
          heading: 6.28,
          pitch: -1.57,
          roll: 0,
        },
      });

      /* 点击拾取 */
      // const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
      //     handler.setInputAction((e) => {
      //         const result = viewer.scene.pick(e.position)
      //         console.log(result)
      //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
      // }
    },


    customBox() {
      var viewer = this.viewer;

      var boxLength = 100000.0;
      var position = Cesium.Cartesian3.fromDegrees(
        116.39,
        39.9,
        0.5 * boxLength
      ); // Box 的质心
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength),
        point: {
          pixelSize: 10,
          color: Cesium.Color.YELLOW,
        },
      });

      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);

      // 0 立方体顶点位置标号，以及坐标系示意图
      // 立方体
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      // 坐标系
      //  z
      //  | /y
      //  |/
      //  o------x

      // 1 定义位置数组
      var v0 = [0.5, -0.5, 0.5];
      var v1 = [-0.5, -0.5, 0.5];
      var v2 = [-0.5, -0.5, -0.5];
      var v3 = [0.5, -0.5, -0.5];
      var v4 = [0.5, 0.5, -0.5];
      var v5 = [0.5, 0.5, 0.5];
      var v6 = [-0.5, 0.5, 0.5];
      var v7 = [-0.5, 0.5, -0.5];
      var rawVertex = [
        // 下 -z
        ...v2,
        ...v3,
        ...v4,
        ...v7,
        // 前 -y
        ...v2,
        ...v3,
        ...v0,
        ...v1,
        // 后 +y
        ...v4,
        ...v7,
        ...v6,
        ...v5,
        // 左 -x
        ...v7,
        ...v2,
        ...v1,
        ...v6,
        // 右 +x
        ...v3,
        ...v4,
        ...v5,
        ...v0,
        // 上 +z
        ...v1,
        ...v0,
        ...v5,
        ...v6,
      ];
      // 乘上box的长度
      var boxVertex = rawVertex.map(function (v) {
        return v * boxLength;
      });
      var positions = new Float64Array(boxVertex);

      // 2 定义法向数组
      var npx = [1, 0, 0];
      var nnx = [-1, 0, 0];
      var npy = [0, 1, 0];
      var nny = [0, -1, 0];
      var npz = [0, 0, 1];
      var nnz = [0, 0, -1];
      var normals = new Float32Array([
        // 下 -z
        ...nnz,
        ...nnz,
        ...nnz,
        ...nnz,
        // 前 -y
        ...nny,
        ...nny,
        ...nny,
        ...nny,
        // 后 +y
        ...npy,
        ...npy,
        ...npy,
        ...npy,
        // 左 -x
        ...nnx,
        ...nnx,
        ...nnx,
        ...nnx,
        // 右 +x
        ...npx,
        ...npx,
        ...npx,
        ...npx,
        // 上 +z
        ...npz,
        ...npz,
        ...npz,
        ...npz,
      ]);

      // 3 定义纹理数组
      var sts = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
      ]);

      // 4 定义索引
      var indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
        14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
      ]);

      // 5 创建Primitive
      var myBox = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.Geometry({
              attributes: {
                position: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                  componentsPerAttribute: 3,
                  values: positions,
                }),
                normal: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 3,
                  values: normals,
                }),
                st: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 2,
                  values: sts,
                }),
              },
              indices: indices,
              primitiveType: Cesium.PrimitiveType.TRIANGLES,
              boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
            }),
            // attributes : {
            //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
            // }
          }),
          // appearance: new Cesium.PerInstanceColorAppearance({
          //     flat : true,
          //     translucent : false
          // }),
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Image", {
              image: "./imgs/blue.png",
            }),
            //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
            closed: true, // 是否为封闭体，实际上执行的是是否进行背面裁剪
          }),
          modelMatrix: modelMatrix,
          asynchronous: false,
        })
      );

      showAxis(myBox, viewer.scene, 100000);

      viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(position, 100000)
      );

      // 6 创建material
      // 6.1 创建纯色material
      var colorMaterial = new Cesium.Material({
        fabric: {
          type: "Color",
          uniforms: {
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
          },
          components: {
            diffuse: "color.bgr",
            alpha: "color.a",
          },
        },
        translucent: false,
      });

      // 6.2 创建图像material
      var imageMaterial = new Cesium.Material({
        fabric: {
          type: "Image",
          uniforms: {
            image:
              "../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png",
            repeat: new Cesium.Cartesian2(1.0, 1.0),
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          },
          components: {
            diffuse:
              "texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb",
            alpha:
              "texture2D(image, fract(repeat * materialInput.st)).a * color.a",
          },
        },
        translucent: false,
      });

      // 6.3 创建组合material
      // Material创建几个material来组合使用，以下其写法
      var compositeMaterial = new Cesium.Material({
        fabric: {
          type: "OurMappedPlastic",
          materials: {
            diffuseMaterial: {
              type: "DiffuseMap",
              uniforms: {
                image: "./imgs/white.png",
              },
            },
            alphaMap: {
              type: "AlphaMap",
              uniforms: {
                image: "./imgs/mixColor.png",
                channel: "r",
              },
            },
          },
          components: {
            diffuse: "diffuseMaterial.diffuse",
            // specular: 'specularMaterial.specular',
            // alpha: 'diffuseMaterial.diffuse.g',
            alpha: "alphaMap.alpha * 3.0",
          },
        },
        translucent: function (material) {
          // return material.uniforms.color.alpha < 1.0;
          return false;
        },
      });

      // 6.4 创建自定义shader的material
      // 模拟纯色到图像的过渡过程
      var customMaterial = new Cesium.Material({
        fabric: {
          type: "MyCustomShader1",
          uniforms: {
            image:
              "../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png",
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
            cellAlpha: 0.3,
          },
          source: `
                        uniform vec4 color;
                        uniform float cellAlpha;

                        czm_material czm_getMaterial(czm_materialInput materialInput)
                        {
                            czm_material material = czm_getDefaultMaterial(materialInput);

                            vec2 st = materialInput.st;
                            float aa = st.s * st.t;
                            vec3 halfColor = color.rgb * aa + texture2D(image, materialInput.st).rgb * (1.0 - aa);
                            halfColor *= 0.5;
                            material.diffuse = halfColor;
                            material.emission = halfColor;
                            // material.alpha = color.a * aa;
                            material.alpha = 1.0;

                            return material;
                        }
                    `,
        },
        translucent: false,
      });

      // // text: '使用纯色材质',
      // myBox.appearance.material = colorMaterial;
      // // text: '使用图像材质',
      // myBox.appearance.material = imageMaterial;
      // // text: '使用组合材质',
      myBox.appearance.material = compositeMaterial;
      // text: '自定义Shader材质',
      // myBox.appearance.material = customMaterial;
      // 平移 myBox
      // position

      let translatedPos = translatePointAlongAxis(position, {
        x: 100000,
        y: 0,
        z: 0,
      });
      viewer.entities.add({
        position: translatedPos,
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
        },
      });

      // let translateMatrix = this.getTranslateModelMatrix(position, { x: -100000, y: 0, z: 0 });
      // let newMatrix = Cesium.Matrix4.multiply(modelMatrix, translateMatrix, new Cesium.Matrix4());
      // myBox.modelMatrix = newMatrix;

      // let newMatrix4 = Cesium.Matrix4.multiply(modelMatrix, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
      // let ray = viewer.camera.getPickRay(translatedPos);
      // let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0), 0, 0 );
      // let m = Cesium.Transforms.headingPitchRollToFixedFrame(
      //     cartesian,
      //     headingPitchRoll,
      //     Cesium.Ellipsoid.WGS84,
      //     Cesium.Transforms.eastNorthUpToFixedFrame,
      //     new Cesium.Matrix4()
      // );
      // myBox.modelMatrix = m;

      // 旋转 --- OK
      // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45)); // rtaleX表示水平方向旋转的度数
      // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationM, new Cesium.Matrix4())
      // myBox.modelMatrix = newMatrix4;

      // 平移 Primitive Model： https://blog.csdn.net/qq_24641385/article/details/106085428
    },
    getTranslateModelMatrix(pos, distances = { x: 0, y: 500, z: 0 }) {
      //平移：
      const frompoint_to_world_matrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(pos); // Matrix4
      // const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米
      const local_translation = new Cesium.Cartesian3(
        distances.x,
        distances.y,
        distances.z
      );
      const result = Cesium.Matrix4.multiplyByPoint(
        frompoint_to_world_matrix,
        local_translation,
        new Cesium.Cartesian3(0, 0, 0)
      ); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
      const targetpoint_to_world_matrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(result);

      const world_translation = new Cesium.Cartesian3(
        targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
        targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
        targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14]
      ); // 向量相减，得到世界坐标下的平移向量

      // 最终的矩阵
      let transitionMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

      return transitionMatrix;
    },

    customPlane() {
      var viewer = this.viewer;

      var boxLength = 100000.0;
      var position = Cesium.Cartesian3.fromDegrees(
        116.39,
        39.9,
        0.5 * boxLength
      ); // Box 的质心
      // viewer.entities.add({
      //     position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength),
      //     point: {
      //         pixelSize: 10,
      //         color: Cesium.Color.YELLOW,
      //     },
      // });

      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      // var modelMatrix = Cesium.Matrix4.IDENTITY;

      // 0 立方体顶点位置标号，以及坐标系示意图
      // 立方体
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      // 坐标系
      //  z
      //  | /y
      //  |/
      //  o------x

      // 1 定义位置数组
      var v0 = [0.5, 0.5, 0];
      var v1 = [0.5, -0.5, 0];
      var v2 = [-0.5, -0.5, 0];
      var v3 = [-0.5, 0.5, 0];
      var rawVertex = [
        // 下 -z
        ...v0,
        ...v1,
        ...v2,
        ...v3,
        // 上 +z
        ...v3,
        ...v2,
        ...v1,
        ...v0,
      ];
      // 乘上box的长度
      var boxVertex = rawVertex.map(function (v) {
        return v * boxLength;
      });
      var positions = new Float64Array(boxVertex);

      // 2 定义法向数组
      var npx = [1, 0, 0];
      var nnx = [-1, 0, 0];
      var npy = [0, 1, 0];
      var nny = [0, -1, 0];
      var npz = [0.1, 0.5, 1];
      var nnz = [0.1, 0.5, -1];
      var normals = new Float32Array([
        // 下 -z
        ...nnz,
        ...nnz,
        ...nnz,
        ...nnz,
        ...npz,
        ...npz,
        ...npz,
        ...npz,
        // 上 +z
      ]);

      // 3 定义纹理数组
      var sts = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
      ]);

      // 4 定义索引
      var indices = new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);

      // 5 创建Primitive
      var myBox = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.Geometry({
              attributes: {
                position: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                  componentsPerAttribute: 3,
                  values: positions,
                }),
                normal: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 3,
                  values: normals,
                }),
                st: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 2,
                  values: sts,
                }),
              },
              indices: indices,
              primitiveType: Cesium.PrimitiveType.TRIANGLES,
              boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
            }),
            // attributes : {
            //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
            // }
          }),
          // appearance: new Cesium.PerInstanceColorAppearance({
          //     flat : true,
          //     translucent : false
          // }),
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Image", {
              image: "./imgs/blue.png",
            }),
            //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
            closed: true, // 是否为封闭体，实际上执行的是是否进行背面裁剪
          }),
          modelMatrix: modelMatrix,
          asynchronous: false,
        })
      );
      // console.log("myBox", myBox);

      showAxis(myBox, viewer.scene, 100000);

      viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(position, 100000)
      );

      // 6 创建material
      // 6.1 创建纯色material
      var colorMaterial = new Cesium.Material({
        fabric: {
          type: "Color",
          uniforms: {
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
          },
          components: {
            diffuse: "color.bgr",
            alpha: "color.a",
          },
        },
        translucent: false,
      });

      // 6.2 创建图像material
      var imageMaterial = new Cesium.Material({
        fabric: {
          type: "Image",
          uniforms: {
            // image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
            // image: './imgs/fromShang/Dirlinetexture02.png',
            image: "./imgs/fromShang/Dirlinetexture01.png",
            repeat: new Cesium.Cartesian2(1.0, 1.0),
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          },
          components: {
            diffuse:
              "texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb",
            alpha:
              "texture2D(image, fract(repeat * materialInput.st)).a * color.a",
          },
        },
        translucent: false,
      });

      // 6.3 创建组合material
      // Material创建几个material来组合使用，以下其写法
      var compositeMaterial = new Cesium.Material({
        fabric: {
          type: "OurMappedPlastic",
          materials: {
            diffuseMaterial: {
              type: "DiffuseMap",
              uniforms: {
                image: "./imgs/white.png",
              },
            },
            alphaMap: {
              type: "AlphaMap",
              uniforms: {
                image: "./imgs/mixColor.png",
                channel: "r",
              },
            },
          },
          components: {
            diffuse: "diffuseMaterial.diffuse",
            // specular: 'specularMaterial.specular',
            // alpha: 'diffuseMaterial.diffuse.g',
            alpha: "alphaMap.alpha * 3.0",
          },
        },
        translucent: function (material) {
          // return material.uniforms.color.alpha < 1.0;
          return false;
        },
      });

      // 6.4 创建自定义shader的material
      // 模拟纯色到图像的过渡过程
      var customMaterial = new Cesium.Material({
        fabric: {
          type: "MyCustomShader1",
          uniforms: {
            image:
              "../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png",
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
            cellAlpha: 0.3,
          },
          source: `
                          uniform vec4 color;
                          uniform float cellAlpha;

                          czm_material czm_getMaterial(czm_materialInput materialInput)
                          {
                              czm_material material = czm_getDefaultMaterial(materialInput);

                              vec2 st = materialInput.st;
                              float aa = st.s * st.t;
                              vec3 halfColor = color.rgb * aa + texture2D(image, materialInput.st).rgb * (1.0 - aa);
                              halfColor *= 0.5;
                              material.diffuse = halfColor;
                              material.emission = halfColor;
                              // material.alpha = color.a * aa;
                              material.alpha = 1.0;

                              return material;
                          }
                      `,
        },
        translucent: false,
      });

      // 带透明的 png
      const material = new Cesium.ImageMaterialProperty({
        image: "./imgs/fromShang/Dirlinetexture02.png",
        repeat: Cesium.Cartesian2(1.0, 1.0), // 不重复
        transparent: true, // 启用png透明
        color: Cesium.Color.WHITE.withAlpha(0.5),
      });
      // myBox.appearance.material = material;

      // // text: '使用纯色材质',
      // myBox.appearance.material = colorMaterial;
      // // text: '使用图像材质',
      myBox.appearance.material = imageMaterial;
      // // text: '使用组合材质',
      // myBox.appearance.material = compositeMaterial;
      // text: '自定义Shader材质',
      // myBox.appearance.material = customMaterial;
      // 平移 myBox
      // position

      // let translatedPos = translatePointAlongAxis(position, { x: 100000, y: 0, z: 0 });
      // // viewer.entities.add({
      // //     position: translatedPos,
      // //     point: {
      // //         pixelSize: 10,
      // //         color: Cesium.Color.RED,
      // //     },
      // // });

      // // let translateMatrix = this.getTranslateModelMatrix(position, { x: -100000, y: 0, z: 0 });
      // // let newMatrix = Cesium.Matrix4.multiply(modelMatrix, translateMatrix, new Cesium.Matrix4());
      // // myBox.modelMatrix = newMatrix;

      // // let newMatrix4 = Cesium.Matrix4.multiply(modelMatrix, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
      // let ray = viewer.camera.getPickRay(translatedPos);
      // let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0),0,0);
      // let m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
      // myBox.modelMatrix = m;

      // 旋转 --- OK
      // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45)); // rtaleX表示水平方向旋转的度数
      // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationM, new Cesium.Matrix4())
      // myBox.modelMatrix = newMatrix4;

      // 平移 Primitive Model： https://blog.csdn.net/qq_24641385/article/details/106085428

      return myBox;
    },
    customPlane_useCartesian(time, pos) {
      var viewer = this.viewer;

      var boxLength = 100000.0;
      var position = Cesium.Cartesian3.fromDegrees(
        116.39,
        39.9,
        0.5 * boxLength
      ); // Box 的质心
      // viewer.entities.add({
      //     position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength),
      //     point: {
      //         pixelSize: 10,
      //         color: Cesium.Color.YELLOW,
      //     },
      // });

      // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      var modelMatrix = Cesium.Matrix4.IDENTITY;

      // 0 立方体顶点位置标号，以及坐标系示意图
      // 立方体
      //    v6----- v5
      //   /|      /|
      //  v1------v0|
      //  | |     | |
      //  | |v7---|-|v4
      //  |/      |/
      //  v2------v3
      // 坐标系
      //  z
      //  | /y
      //  |/
      //  o------x

      // 1 定义位置数组
      // -110.0, 30.0,
      // -100.0, 40.0
      var height = 1000000.0;
      var v0 = Cesium.Cartesian3.fromDegrees(-110.0, 30.0, height);
      var v1 = Cesium.Cartesian3.fromDegrees(-100.0, 30.0, height);
      var v2 = Cesium.Cartesian3.fromDegrees(-110.0, 40.0, height);
      var v3 = Cesium.Cartesian3.fromDegrees(-100.0, 40.0, height);
      // var v0 = [0.5, 0.5, 0];
      // var v1 = [0.5, -0.5, 0];
      // var v2 = [-0.5, -0.5, 0];
      // var v3 = [-0.5, 0.5, 0];
      // var rawVertex = [
      //     // 下 -z
      //     ...v0, ...v1, ...v2, ...v3,
      //     // 上 +z
      //     ...v3,...v2,...v1, ...v0,
      // ];
      // // 乘上box的长度
      // var boxVertex = rawVertex.map(function(v) {
      //     return v * boxLength;
      // });
      // var positions = new Float64Array(boxVertex);// new Float32Array(this.positionArray),
      let arr = [];
      // let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
      arr.push(v0.x);
      arr.push(v0.y);
      arr.push(v0.z);

      arr.push(v1.x);
      arr.push(v1.y);
      arr.push(v1.z);

      arr.push(v2.x);
      arr.push(v2.y);
      arr.push(v2.z);

      arr.push(v3.x);
      arr.push(v3.y);
      arr.push(v3.z);

      arr.push(v3.x);
      arr.push(v3.y);
      arr.push(v3.z);

      arr.push(v2.x);
      arr.push(v2.y);
      arr.push(v2.z);

      arr.push(v1.x);
      arr.push(v1.y);
      arr.push(v1.z);

      arr.push(v0.x);
      arr.push(v0.y);
      arr.push(v0.z);

      console.log("arr", arr);
      var positions = new Float64Array(arr);
      console.log("positions", positions);
      // 2 定义法向数组
      var npx = [1, 0, 0];
      var nnx = [-1, 0, 0];
      var npy = [0, 1, 0];
      var nny = [0, -1, 0];
      var npz = [0, 0, 1];
      var nnz = [0, 0, -1];
      var normals = new Float32Array([
        // 下 -z
        ...nnz,
        ...nnz,
        ...nnz,
        ...nnz,
        // 上 +z
        ...npz,
        ...npz,
        ...npz,
        ...npz,
      ]);

      // 3 定义纹理数组
      var sts = new Float32Array([
        0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
      ]);

      // 4 定义索引
      var indices = new Uint16Array([
        // 0, 1, 2, 1, 2, 3,
        // 4, 5, 6, 5, 6, 7,
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
      ]);

      // 5 创建Primitive
      var myBox = viewer.scene.primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.Geometry({
              attributes: {
                position: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                  componentsPerAttribute: 3,
                  values: positions,
                }),
                normal: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 3,
                  values: normals,
                }),
                st: new Cesium.GeometryAttribute({
                  componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  componentsPerAttribute: 2,
                  values: sts,
                }),
              },
              indices: indices,
              primitiveType: Cesium.PrimitiveType.TRIANGLES,
              boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
            }),
            // attributes : {
            //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1.0))
            // }
          }),
          // appearance: new Cesium.PerInstanceColorAppearance({
          //     flat : true,
          //     translucent : false
          // }),
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Image", {
              image: "./imgs/blue.png",
            }),
            //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
            closed: true, // 是否为封闭体，实际上执行的是是否进行背面裁剪
          }),
          modelMatrix: modelMatrix,
          asynchronous: false,
        })
      );
      // console.log("myBox", myBox);

      showAxis(myBox, viewer.scene, 100000);

      viewer.camera.flyToBoundingSphere(
        new Cesium.BoundingSphere(position, 100000)
      );

      // 6 创建material
      // 6.1 创建纯色material
      var colorMaterial = new Cesium.Material({
        fabric: {
          type: "Color",
          uniforms: {
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
          },
          components: {
            diffuse: "color.bgr",
            alpha: "color.a",
          },
        },
        translucent: false,
      });

      // 6.2 创建图像material
      var imageMaterial = new Cesium.Material({
        fabric: {
          type: "Image",
          uniforms: {
            // image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
            // image: './imgs/fromShang/Dirlinetexture02.png',
            image: "./imgs/fromShang/Dirlinetexture01.png",
            repeat: new Cesium.Cartesian2(1.0, 1.0),
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
          },
          components: {
            diffuse:
              "texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb",
            alpha:
              "texture2D(image, fract(repeat * materialInput.st)).a * color.a",
          },
        },
        translucent: false,
      });

      // 6.3 创建组合material
      // Material创建几个material来组合使用，以下其写法
      var compositeMaterial = new Cesium.Material({
        fabric: {
          type: "OurMappedPlastic",
          materials: {
            diffuseMaterial: {
              type: "DiffuseMap",
              uniforms: {
                image: "./imgs/white.png",
              },
            },
            alphaMap: {
              type: "AlphaMap",
              uniforms: {
                image: "./imgs/mixColor.png",
                channel: "r",
              },
            },
          },
          components: {
            diffuse: "diffuseMaterial.diffuse",
            // specular: 'specularMaterial.specular',
            // alpha: 'diffuseMaterial.diffuse.g',
            alpha: "alphaMap.alpha * 3.0",
          },
        },
        translucent: function (material) {
          // return material.uniforms.color.alpha < 1.0;
          return false;
        },
      });

      // 6.4 创建自定义shader的material
      // 模拟纯色到图像的过渡过程
      var customMaterial = new Cesium.Material({
        fabric: {
          type: "MyCustomShader1",
          uniforms: {
            image:
              "../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png",
            color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
            cellAlpha: 0.3,
          },
          source: `
                          uniform vec4 color;
                          uniform float cellAlpha;

                          czm_material czm_getMaterial(czm_materialInput materialInput)
                          {
                              czm_material material = czm_getDefaultMaterial(materialInput);

                              vec2 st = materialInput.st;
                              float aa = st.s * st.t;
                              vec3 halfColor = color.rgb * aa + texture2D(image, materialInput.st).rgb * (1.0 - aa);
                              halfColor *= 0.5;
                              material.diffuse = halfColor;
                              material.emission = halfColor;
                              // material.alpha = color.a * aa;
                              material.alpha = 1.0;

                              return material;
                          }
                      `,
        },
        translucent: false,
      });

      // 带透明的 png
      const material = new Cesium.ImageMaterialProperty({
        image: "./imgs/fromShang/Dirlinetexture02.png",
        repeat: Cesium.Cartesian2(1.0, 1.0), // 不重复
        transparent: true, // 启用png透明
        color: Cesium.Color.WHITE.withAlpha(0.5),
      });
      // myBox.appearance.material = material;

      // // text: '使用纯色材质',
      // myBox.appearance.material = colorMaterial;
      // // text: '使用图像材质',
      myBox.appearance.material = imageMaterial;
      // // text: '使用组合材质',
      // myBox.appearance.material = compositeMaterial;
      // text: '自定义Shader材质',
      // myBox.appearance.material = customMaterial;
      // 平移 myBox
      // position

      // let translatedPos = translatePointAlongAxis(position, { x: 100000, y: 0, z: 0 });
      // // viewer.entities.add({
      // //     position: translatedPos,
      // //     point: {
      // //         pixelSize: 10,
      // //         color: Cesium.Color.RED,
      // //     },
      // // });

      // // let translateMatrix = this.getTranslateModelMatrix(position, { x: -100000, y: 0, z: 0 });
      // // let newMatrix = Cesium.Matrix4.multiply(modelMatrix, translateMatrix, new Cesium.Matrix4());
      // // myBox.modelMatrix = newMatrix;

      // // let newMatrix4 = Cesium.Matrix4.multiply(modelMatrix, rotationM, new Cesium.Matrix4());// 计算矩阵4的变换矩阵（在原变换中，累加变换）
      // let ray = viewer.camera.getPickRay(translatedPos);
      // let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      // let headingPitchRoll = new Cesium.HeadingPitchRoll( Cesium.Math.toRadians(0),0,0);
      // let m = Cesium.Transforms.headingPitchRollToFixedFrame(cartesian, headingPitchRoll, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.Matrix4());
      // myBox.modelMatrix = m;

      // 旋转 --- OK
      // let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(45)); // rtaleX表示水平方向旋转的度数
      // let newMatrix4 = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationM, new Cesium.Matrix4())
      // myBox.modelMatrix = newMatrix4;

      // 平移 Primitive Model： https://blog.csdn.net/qq_24641385/article/details/106085428

      return myBox;
    },

    allBasicPrimitives() {
      let scene = this.viewer.scene;

      Cesium.Math.setRandomNumberSeed(1234);// 什么作用？？？
      var primitives = scene.primitives;
      var solidWhite = Cesium.ColorGeometryInstanceAttribute.fromColor( Cesium.Color.WHITE );
      // Combine instances for a rectangle, polygon, ellipse, and circle into a single primitive.
      var rectangle = Cesium.Rectangle.fromDegrees(-92.0, 20.0, -86.0, 27.0);
      var rectangleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
          stRotation: Cesium.Math.toRadians(45),
        }),
      });
      var rectangleOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleOutlineGeometry({
          rectangle: rectangle,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      var positions = Cesium.Cartesian3.fromDegreesArray([
        -107.0, 27.0, -107.0, 22.0, -102.0, 23.0, -97.0, 21.0, -97.0, 25.0,
      ]);
      var polygonInstance = new Cesium.GeometryInstance({
        geometry: Cesium.PolygonGeometry.fromPositions({
          positions: positions,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      var polygonOutlineInstance = new Cesium.GeometryInstance({
        geometry: Cesium.PolygonOutlineGeometry.fromPositions({
          positions: positions,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      var center = Cesium.Cartesian3.fromDegrees(-80.0, 25.0);
      var semiMinorAxis = 300000.0;
      var semiMajorAxis = 500000.0;
      var rotation = Cesium.Math.toRadians(-40.0);
      var ellipseInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          rotation: rotation,
          stRotation: Cesium.Math.toRadians(22),
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      var ellipseOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseOutlineGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          rotation: rotation,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      center = Cesium.Cartesian3.fromDegrees(-72.0, 25.0);
      var radius = 250000.0;
      var circleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CircleGeometry({
          center: center,
          radius: radius,
          stRotation: Cesium.Math.toRadians(90),
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      var circleOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CircleOutlineGeometry({
          center: center,
          radius: radius,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            rectangleInstance,
            polygonInstance,
            ellipseInstance,
            circleInstance,
          ],
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: Cesium.Material.fromType("Stripe"),
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            rectangleOutlineInstance,
            polygonOutlineInstance,
            ellipseOutlineInstance,
            circleOutlineInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      // Create extruded rectangle
      rectangle = Cesium.Rectangle.fromDegrees(-118.0, 38.0, -116.0, 40.0);
      var extrudedHeight = 500000.0;
      var extrudedRectangle = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var extrudedOutlineRectangle = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleOutlineGeometry({
          rectangle: rectangle,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      // Create extruded ellipse
      center = Cesium.Cartesian3.fromDegrees(-117.0, 35.0);
      semiMinorAxis = 100000.0;
      semiMajorAxis = 200000.0;
      rotation = Cesium.Math.toRadians(90);
      var height = 100000.0;
      extrudedHeight = 200000.0;
      var extrudedEllipse = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          height: height,
          rotation: rotation,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var extrudedOutlineEllipse = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseOutlineGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          height: height,
          rotation: rotation,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      // Create extruded polygon
      var polygonHierarchy = {
        positions: Cesium.Cartesian3.fromDegreesArray([
          -118.0, 30.0, -115.0, 30.0, -117.1, 31.1, -118.0, 33.0,
        ]),
      };
      height = 300000.0;
      extrudedHeight = 700000.0;
      var extrudedPolygon = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: polygonHierarchy,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          extrudedHeight: extrudedHeight,
          height: height,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var extrudedOutlinePolygon = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonOutlineGeometry({
          polygonHierarchy: polygonHierarchy,
          extrudedHeight: extrudedHeight,
          height: height,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      // cylinder
      var length = 200000.0;
      var topRadius = 150000.0;
      var bottomRadius = 150000.0;
      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(-70.0, 45.0)
        ),
        new Cesium.Cartesian3(0.0, 0.0, 100000.0),
        new Cesium.Matrix4()
      );
      var cylinderInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CylinderGeometry({
          length: length,
          topRadius: topRadius,
          bottomRadius: bottomRadius,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var cylinderOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CylinderOutlineGeometry({
          length: length,
          topRadius: topRadius,
          bottomRadius: bottomRadius,
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: solidWhite,
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            extrudedPolygon,
            extrudedRectangle,
            extrudedEllipse,
            cylinderInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            extrudedOutlineRectangle,
            extrudedOutlineEllipse,
            extrudedOutlinePolygon,
            cylinderOutlineInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      // Create box and ellipsoid boxes, and use the instance's
      // modelMatrix to scale and position them.
      var dimensions = new Cesium.Cartesian3(1.0, 1.0, 1.0);
      var boxGeometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: dimensions,
      });
      var boxOutlineGeometry = Cesium.BoxOutlineGeometry.fromDimensions({
        dimensions: dimensions,
      });
      var radii = new Cesium.Cartesian3(0.5, 0.5, 1.0);
      var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radii: radii,
      });
      var ellipsoidOutlineGeometry = new Cesium.EllipsoidOutlineGeometry({
        radii: radii,
        stackPartitions: 6,
        slicePartitions: 5,
      });
      radius = 0.75;
      var sphereGeometry = new Cesium.SphereGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radius: radius,
      });
      var sphereOutlineGeometry = new Cesium.SphereOutlineGeometry({
        radius: radius,
        stackPartitions: 6,
        slicePartitions: 5,
      });
      var instances = [];
      var outlineInstances = [];
      var i;
      var boxModelMatrix, ellipsoidModelMatrix, sphereModelMatrix;
      for (i = 0; i < 5; ++i) {
        height = 100000.0 + 200000.0 * i;
        boxModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-106.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        ellipsoidModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-102.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        sphereModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-98.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: boxGeometry,
            modelMatrix: boxModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 1.0,
                })
              ),
            },
          })
        );
        outlineInstances.push(
          new Cesium.GeometryInstance({
            geometry: boxOutlineGeometry,
            modelMatrix: boxModelMatrix,
            attributes: {
              color: solidWhite,
            },
          })
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: ellipsoidGeometry,
            modelMatrix: ellipsoidModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 1.0,
                })
              ),
            },
          })
        );
        outlineInstances.push(
          new Cesium.GeometryInstance({
            geometry: ellipsoidOutlineGeometry,
            modelMatrix: ellipsoidModelMatrix,
            attributes: {
              color: solidWhite,
            },
          })
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: sphereGeometry,
            modelMatrix: sphereModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 1.0,
                })
              ),
            },
          })
        );
        outlineInstances.push(
          new Cesium.GeometryInstance({
            geometry: sphereOutlineGeometry,
            modelMatrix: sphereModelMatrix,
            attributes: {
              color: solidWhite,
            },
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: instances,
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: outlineInstances,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      // Create a single wall
      positions = Cesium.Cartesian3.fromDegreesArray([
        -95.0, 50.0, -85.0, 50.0, -75.0, 50.0,
      ]);
      var maximumHeights = [500000, 1000000, 500000];
      var minimumHeights = [0, 500000, 0];
      var wallInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.WallGeometry({
          positions: positions,
          maximumHeights: maximumHeights,
          minimumHeights: minimumHeights,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 0.7,
            })
          ),
        },
      });
      var wallOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.WallOutlineGeometry({
          positions: positions,
          maximumHeights: maximumHeights,
          minimumHeights: minimumHeights,
        }),
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute(0.7, 0.7, 0.7, 1.0),
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: wallInstance,
          appearance: new Cesium.PerInstanceColorAppearance(),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: wallOutlineInstance,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      rectangle = Cesium.Rectangle.fromDegrees(-92.0, 30.0, -85.0, 40.0);
      rectangleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      polygonHierarchy = {
        positions: Cesium.Cartesian3.fromDegreesArray([
          -109.0, 30.0, -95.0, 30.0, -95.0, 40.0, -109.0, 40.0,
        ]),
        holes: [
          {
            positions: Cesium.Cartesian3.fromDegreesArray([
              -107.0, 31.0, -107.0, 39.0, -97.0, 39.0, -97.0, 31.0,
            ]),
            holes: [
              {
                positions: Cesium.Cartesian3.fromDegreesArray([
                  -105.0, 33.0, -99.0, 33.0, -99.0, 37.0, -105.0, 37.0,
                ]),
                holes: [
                  {
                    positions: Cesium.Cartesian3.fromDegreesArray([
                      -103.0, 34.0, -101.0, 34.0, -101.0, 36.0, -103.0, 36.0,
                    ]),
                  },
                ],
              },
            ],
          },
        ],
      };
      polygonInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: polygonHierarchy,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      center = Cesium.Cartesian3.fromDegrees(-80.0, 35.0);
      semiMinorAxis = 200000.0;
      semiMajorAxis = 500000.0;
      rotation = Cesium.Math.toRadians(30.0);
      ellipseInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          rotation: rotation,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      center = Cesium.Cartesian3.fromDegrees(-72.0, 35.0);
      radius = 200000.0;
      circleInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CircleGeometry({
          center: center,
          radius: radius,
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            rectangleInstance,
            polygonInstance,
            ellipseInstance,
            circleInstance,
          ],
          appearance: new Cesium.EllipsoidSurfaceAppearance({
            material: Cesium.Material.fromType("Stripe"),
          }),
        })
      );
      // Create extruded rectangle
      rectangle = Cesium.Rectangle.fromDegrees(-110.0, 38.0, -107.0, 40.0);
      height = 700000.0;
      extrudedHeight = 1000000.0;
      rotation = Cesium.Math.toRadians(45.0);
      extrudedRectangle = new Cesium.GeometryInstance({
        geometry: new Cesium.RectangleGeometry({
          rectangle: rectangle,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          height: height,
          rotation: rotation,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      // Create extruded ellipse
      center = Cesium.Cartesian3.fromDegrees(-110.0, 35.0);
      semiMinorAxis = 100000.0;
      semiMajorAxis = 200000.0;
      rotation = Cesium.Math.toRadians(-40.0);
      height = 300000.0;
      extrudedHeight = 700000.0;
      extrudedEllipse = new Cesium.GeometryInstance({
        geometry: new Cesium.EllipseGeometry({
          center: center,
          semiMinorAxis: semiMinorAxis,
          semiMajorAxis: semiMajorAxis,
          rotation: rotation,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          height: height,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      // Create extruded polygon
      polygonHierarchy = {
        positions: Cesium.Cartesian3.fromDegreesArray([
          -113.0, 30.0, -110.0, 30.0, -110.0, 33.0, -111.5, 31.0, -113.0, 33.0,
        ]),
      };
      extrudedHeight = 300000.0;
      extrudedPolygon = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: polygonHierarchy,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          extrudedHeight: extrudedHeight,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      // cylinder
      length = 400000.0;
      topRadius = 0.0;
      bottomRadius = 200000.0;
      modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(-70.0, 40.0)
        ),
        new Cesium.Cartesian3(0.0, 0.0, 200000.0),
        new Cesium.Matrix4()
      );
      cylinderInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CylinderGeometry({
          length: length,
          topRadius: topRadius,
          bottomRadius: bottomRadius,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            extrudedPolygon,
            extrudedRectangle,
            extrudedEllipse,
            cylinderInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }),
        })
      );
      // Combine instances each with a unique color.
      // We can combine heterogeneous geometries as we
      // do here as long as vertex formats match.
      instances = [];
      center = Cesium.Cartesian3.fromDegrees(-65.0, 35.0);
      radius = 200000.0;
      rectangle = Cesium.Rectangle.fromDegrees(-67.0, 27.0, -63.0, 32.0);
      for (i = 0; i < 5; ++i) {
        height = 200000.0 * i;
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.CircleGeometry({
              center: center,
              radius: radius,
              height: height,
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                })
              ),
            },
          })
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
              rectangle: rectangle,
              height: height,
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            }),
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                })
              ),
            },
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: instances,
          appearance: new Cesium.PerInstanceColorAppearance(),
        })
      );
      // Create box and ellipsoid boxes, and use the instance's
      // modelMatrix to scale and position them.
      dimensions = new Cesium.Cartesian3(1.0, 1.0, 1.0);
      boxGeometry = Cesium.BoxGeometry.fromDimensions({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        dimensions: dimensions,
      });
      radii = new Cesium.Cartesian3(0.5, 0.5, 1.0);
      ellipsoidGeometry = new Cesium.EllipsoidGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radii: radii,
      });
      radius = 0.75;
      sphereGeometry = new Cesium.SphereGeometry({
        vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        radius: radius,
      });
      instances = [];
      outlineInstances = [];
      for (i = 0; i < 5; ++i) {
        height = 100000.0 + 200000.0 * i;
        boxModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-108.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        ellipsoidModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-104.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        sphereModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
          Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(
              Cesium.Cartesian3.fromDegrees(-100.0, 45.0)
            ),
            new Cesium.Cartesian3(0.0, 0.0, height),
            new Cesium.Matrix4()
          ),
          90000.0,
          new Cesium.Matrix4()
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: boxGeometry,
            modelMatrix: boxModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                })
              ),
            },
          })
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: ellipsoidGeometry,
            modelMatrix: ellipsoidModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                })
              ),
            },
          })
        );
        instances.push(
          new Cesium.GeometryInstance({
            geometry: sphereGeometry,
            modelMatrix: sphereModelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                Cesium.Color.fromRandom({
                  alpha: 0.5,
                })
              ),
            },
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: instances,
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: true,
            closed: true,
          }),
        })
      );
      positions = [];
      var colors = [];
      for (i = 0; i < 40; ++i) {
        positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 48.0));
        colors.push(
          Cesium.Color.fromRandom({
            alpha: 1.0,
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.SimplePolylineGeometry({
              positions: positions,
              colors: colors,
            }),
          }),
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            renderState: {
              // Override the appearance render state to change the
              // line width on system's that support it (Linx/Mac).
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      // create a polyline with a material
      positions = [];
      for (i = 0; i < 40; ++i) {
        positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 15.0));
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 10.0,
              vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
            }),
          }),
          appearance: new Cesium.PolylineMaterialAppearance({
            material: Cesium.Material.fromType(Cesium.Material.PolylineGlowType),
          }),
        })
      );
      // create a polyline with per segment colors
      positions = [];
      colors = [];
      for (i = 0; i < 40; ++i) {
        positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 12.0));
        colors.push(
          Cesium.Color.fromRandom({
            alpha: 1.0,
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 10.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
              colors: colors,
            }),
          }),
          appearance: new Cesium.PolylineColorAppearance(),
        })
      );
      // create a polyline with per vertex colors
      positions = [];
      colors = [];
      for (i = 0; i < 40; ++i) {
        positions.push(Cesium.Cartesian3.fromDegrees(-100.0 + i, 9.0));
        colors.push(
          Cesium.Color.fromRandom({
            alpha: 1.0,
          })
        );
      }
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
              positions: positions,
              width: 10.0,
              vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
              colors: colors,
              colorsPerVertex: true,
            }),
          }),
          appearance: new Cesium.PolylineColorAppearance(),
        })
      );
      // Create a single wall
      positions = Cesium.Cartesian3.fromDegreesArrayHeights([
        -90.0, 43.0, 100000.0, -87.5, 45.0, 100000.0, -85.0, 43.0, 100000.0,
        -87.5, 41.0, 100000.0, -90.0, 43.0, 100000.0,
      ]);
      wallInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.WallGeometry({
          positions: positions,
        }),
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: wallInstance,
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("Checkerboard", {
              repeat: new Cesium.Cartesian2(20.0, 6.0),
            }),
          }),
        })
      );
      positions = Cesium.Cartesian3.fromDegreesArray([
        -120.0, 45.0, -125.0, 50.0, -125.0, 55.0,
      ]);
      var width = 100000;
      var corridor = new Cesium.GeometryInstance({
        geometry: new Cesium.CorridorGeometry({
          positions: positions,
          width: width,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var extrudedCorridor = new Cesium.GeometryInstance({
        geometry: new Cesium.CorridorGeometry({
          positions: positions,
          width: width,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          height: 300000,
          extrudedHeight: 400000,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 0.7,
            })
          ),
        },
      });
      var corridorOutline = new Cesium.GeometryInstance({
        geometry: new Cesium.CorridorOutlineGeometry({
          positions: positions,
          width: width,
          height: 700000,
        }),
        attributes: {
          color: solidWhite,
        },
      });
      var corridorFill = new Cesium.GeometryInstance({
        geometry: new Cesium.CorridorGeometry({
          positions: positions,
          width: width,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          height: 700000,
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 0.7,
            })
          ),
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [corridor, extrudedCorridor, corridorFill],
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: true,
            closed: true,
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: corridorOutline,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
      function starPositions(arms, rOuter, rInner) {
        var angle = Math.PI / arms;
        var pos = [];
        for (var i = 0; i < 2 * arms; i++) {
          var r = i % 2 === 0 ? rOuter : rInner;
          var p = new Cesium.Cartesian2(
            Math.cos(i * angle) * r,
            Math.sin(i * angle) * r
          );
          pos.push(p);
        }
        return pos;
      }
      positions = Cesium.Cartesian3.fromDegreesArrayHeights([
        -102.0, 15.0, 100000.0, -105.0, 20.0, 200000.0, -110.0, 20.0, 100000.0,
      ]);
      var polylineVolumeFill = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineVolumeGeometry({
          polylinePositions: positions,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          shapePositions: starPositions(7, 30000.0, 20000.0),
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var polylineVolumeOutline = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineVolumeOutlineGeometry({
          polylinePositions: positions,
          shapePositions: starPositions(7, 30000.0, 20000.0),
        }),
        attributes: {
          color: solidWhite,
        },
      });
      var polylineVolume = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineVolumeGeometry({
          polylinePositions: Cesium.Cartesian3.fromDegreesArray([
            -102.0, 15.0, -105.0, 20.0, -110.0, 20.0,
          ]),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          shapePositions: starPositions(7, 30000, 20000),
        }),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      function computeCircle(radius) {
        var positions = [];
        for (var i = 0; i < 360; i++) {
          var radians = Cesium.Math.toRadians(i);
          positions.push(
            new Cesium.Cartesian2(
              radius * Math.cos(radians),
              radius * Math.sin(radians)
            )
          );
        }
        return positions;
      }
      var tubeGeometry = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineVolumeGeometry({
          polylinePositions: Cesium.Cartesian3.fromDegreesArray([
            -104.0, 13.0, -107.0, 18.0, -112.0, 18.0,
          ]),
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          shapePositions: computeCircle(40000.0),
        }),
        attributes: {
          color: solidWhite,
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [tubeGeometry, polylineVolume, polylineVolumeFill],
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: polylineVolumeOutline,
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: 1.0,
            },
          }),
        })
      );
    },

    EllipsoidPrimitive() {
      // from Source Code: Source/DataSources/EllipsoidGeometryUpdater.   function createFillGeometryInstance & function

      // function DistanceDisplayConditionGeometryInstanceAttribute(near, far) {
      var distanceDisplayConditionAttribute = DistanceDisplayConditionGeometryInstanceAttribute.fromDistanceDisplayCondition(
        distanceDisplayCondition
      );// 需要知道是谁的实例： DistanceDisplayConditionGeometryInstanceAttribute {value: Float32Array(2)}
      let attributes = {
        show: true,
        distanceDisplayCondition: distanceDisplayConditionAttribute,
        color: undefined,
        offset: undefined,
      };

      let fillInstance = new GeometryInstance({
        id: 'entity',
        geometry: new EllipsoidGeometry(this._options),
        modelMatrix: skipModelMatrix
          ? undefined
          : entity.computeModelMatrixForHeightReference(
              time,
              entity.ellipsoid.heightReference,
              this._options.radii.z * 0.5,
              this._scene.mapProjection.ellipsoid,
              modelMatrixResult
            ),
        attributes: attributes,
      });


      var material = MaterialProperty.getValue(
        time,
        defaultValue(ellipsoid.material, defaultMaterial),
        this._material
      );// 需要知道是谁的实例 ： Material {type: 'Color', shaderSource: 'uniform vec4 color_0;czm_material czm_getMaterial(…\nmaterial.alpha = color_0.a; \nreturn material;\n}\n', materials: {…}, uniforms: {…}, _uniforms: {…}, …}
      var shadows = 0; //this._geometryUpdater.shadowsProperty.getValue(time);//需要知道是谁的实例： [ shadows ]-505 0
      var appearance = new MaterialAppearance({
        material: material,
        translucent: material.isTranslucent(),
        closed: true,
      });

      let fillPrimitive = this.viewer.scene.primitives.add(
        new Primitive({
          geometryInstances: fillInstance,
          appearance: appearance,
          asynchronous: false,
          shadows: shadows,
        })
      );
    },
    EllipsoidPrimitiveFromVersion1_2D() {
      var primitives = this.viewer.scene.primitives;

      // This appearance can be used for any geometry that
      // is parallel to the globe surface.

      // Stripe Material
      primitives.add(new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
              geometry : new Cesium.RectangleGeometry({
                  rectangle : Cesium.Rectangle.fromDegrees(-120.0, 30.0, -110.0, 40.0),
                  vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
              })
          }),
          appearance : new Cesium.EllipsoidSurfaceAppearance({
              material : Cesium.Material.fromType('Stripe')
          })
      }));

      // Dot Material
      primitives.add(new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
              geometry : new Cesium.RectangleGeometry({
                  rectangle : Cesium.Rectangle.fromDegrees(-110.0, 30.0, -100.0, 40.0),
                  vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
              })
          }),
          appearance : new Cesium.EllipsoidSurfaceAppearance({
              material : Cesium.Material.fromType('Dot')
          })
      }));

      // Checkerboard Material
      primitives.add(new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
              geometry : new Cesium.RectangleGeometry({
                  rectangle : Cesium.Rectangle.fromDegrees(-100.0, 30.0, -90.0, 40.0),
                  vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
              })
          }),
          appearance : new Cesium.EllipsoidSurfaceAppearance({
              material : Cesium.Material.fromType('Checkerboard')
          })
      }));

      // Grid Material
      primitives.add(new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
              geometry : new Cesium.RectangleGeometry({
                  rectangle : Cesium.Rectangle.fromDegrees(-90.0, 30.0, -80.0, 40.0),
                  vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
              })
          }),
          appearance : new Cesium.EllipsoidSurfaceAppearance({
              material : Cesium.Material.fromType('Grid')
          })
      }));
    },
    EllipsoidPrimitiveFromVersion1_3DOutline() {
      var primitives = this.viewer.scene.primitives;

      // Draw a the outline of an ellipsoid and position
      // it on the globe surface.

      var radii = new Cesium.Cartesian3(200000.0, 200000.0, 300000.0);
      var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(-102.0, 45.0);

      this.addPoint_test([positionOnEllipsoid]);

      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
        new Cesium.Cartesian3(0.0, 0.0, radii.z),//为了让整个模型都在地表之上
        // new Cesium.Cartesian3(0.0, 0.0, 0.0),
        new Cesium.Matrix4()
      );
      // Create a ellipsoid geometry.
      var ellipsoidOutlineGeometry = new Cesium.EllipsoidOutlineGeometry({
          radii : radii,
          stackPartitions : 16,
          slicePartitions : 8
      });
      // Create a geometry instance using the geometry
      // and model matrix created above.
      var ellipseOutlineInstance = new Cesium.GeometryInstance({
          geometry : ellipsoidOutlineGeometry,
          modelMatrix : modelMatrix,
          attributes : {
              color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.WHITE)
          }
      });

      // Add the geometry instance to primitives.
      let outlineEllipsoid = primitives.add(new Cesium.Primitive({
          geometryInstances : ellipseOutlineInstance,
          appearance : new Cesium.PerInstanceColorAppearance({
              flat : true,
              renderState : {
                  depthTest : {
                      enabled : true
                  },
                  lineWidth : Math.min(2.0, this.viewer.scene.maximumAliasedLineWidth)
              }
          })
      }));
      console.log("outlineEllipsoid", outlineEllipsoid);
    },
    EllipsoidPrimitiveFromVersion1_3DFill() {
      // const globe = this.viewer.scene.globe;
      // const baseLayer = this.viewer.scene.imageryLayers.get(0);

      // globe.showGroundAtmosphere = false;
      // globe.baseColor = Cesium.Color.TRANSPARENT;
      // globe.translucency.enabled = true;
      // globe.undergroundColor = undefined;

      // // Set oceans on Bing base layer to transparent
      // baseLayer.colorToAlpha = new Cesium.Color(0.0, 0.016, 0.059);
      // baseLayer.colorToAlphaThreshold = 0.2;



      var primitives = this.viewer.scene.primitives;

      // Draw a blue ellipsoid and position it on the globe surface.

      var radii = new Cesium.Cartesian3(200000.0, 200000.0, 200000.0);
      // Ellipsoid geometries are initially centered on the origin.
      // We can use a model matrix to position the ellipsoid on the
      // globe surface.
      var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(-100.0, 40.0);

      let point_ = this.addSinglePoint_test(positionOnEllipsoid);

      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
        // new Cesium.Cartesian3(0.0, 0.0, radii.z),
        new Cesium.Cartesian3(0.0, 0.0, 0.0),
        new Cesium.Matrix4()
      );
      // Create a ellipsoid geometry.
      var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
        vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,// VertexFormat.DEFAULT] The vertex attributes to be computed.
        radii : radii, // Cartesian3(1.0, 1.0, 1.0)] The radii of the ellipsoid in the x, y, and z directions.
        minimumClock: Math.PI/4,//     0.0 ] The minimum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
        maximumClock: Math.PI*2,// 2*PI] The maximum angle lying in the xy-plane measured from the positive x-axis and toward the positive y-axis.
        minimumCone: Math.PI/6, //     0.0 ] The minimum angle measured from the positive z-axis and toward the negative z-axis.
        maximumCone: Math.PI/2,//  PI  ] The maximum angle measured from the positive z-axis and toward the negative z-axis.
        stackPartitions: 64,// 64] The number of times to partition the ellipsoid into stacks.
        slicePartitions: 64,// 64] The number of times to partition the ellipsoid into radial slices.
      });
      // Create a geometry instance using the geometry
      // and model matrix created above.
      var ellipsoidInstance = new Cesium.GeometryInstance({
          geometry : ellipsoidGeometry,
          modelMatrix : modelMatrix,
          attributes : {
              color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE.withAlpha(0.5))
          }
      });
      // Add the geometry instance to primitives.
      let fillEllipsoid = primitives.add(new Cesium.Primitive({
          geometryInstances : [ellipsoidInstance],
          appearance : new Cesium.PerInstanceColorAppearance({
            translucent : true,
            closed: true,
            vertexShaderSource: `
              attribute vec3 position3DHigh;
              attribute vec3 position3DLow;
              attribute vec3 normal;
              attribute vec4 color;
              attribute float batchId;

              varying vec3 v_positionEC;
              varying vec3 v_normalEC;
              varying vec4 v_color;

              void main()
              {
                  vec4 p = czm_computePosition();

                  v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                  // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                  v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                  v_color = color;

                  gl_Position = czm_modelViewProjectionRelativeToEye * p;
                  // gl_Position = czm_modelViewProjection * p;
              }
            `,
            fragmentShaderSource: `
              varying vec3 v_positionEC;
              varying vec3 v_normalEC;
              varying vec4 v_color;

              void main()
              {
                  vec3 positionToEyeEC = -v_positionEC;

                  vec3 normalEC = normalize(v_normalEC);
              #ifdef FACE_FORWARD
                  normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
              #endif

                  vec4 color = czm_gammaCorrect(v_color);

                  czm_materialInput materialInput;
                  materialInput.normalEC = normalEC;
                  materialInput.positionToEyeEC = positionToEyeEC;
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  material.diffuse = color.rgb;
                  material.alpha = color.a;

                  gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
              }
            `,
          })
      }));



      /*
        "
          attribute vec3 position3DHigh;
          attribute vec3 position3DLow;
          attribute vec3 normal;
          attribute vec4 color;
          attribute float batchId;

          varying vec3 v_positionEC;
          varying vec3 v_normalEC;
          varying vec4 v_color;

          void main()
          {
              vec4 p = czm_computePosition();

              v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
              v_normalEC = czm_normal * normal;                         // normal in eye coordinates
              v_color = color;

              gl_Position = czm_modelViewProjectionRelativeToEye * p;
          }
        "
      */
      console.log("fillEllipsoid", fillEllipsoid);// 不是一个集合，就是一个单一的 Primitive

    },
    EllipsoidPrimitiveFromVersion1_3DFill_ByRectangle() {
      var primitives = this.viewer.scene.primitives;

      // Example 1: Draw a red rectangle on the globe surface.
      var redRectangleInstance = new Cesium.GeometryInstance({
          geometry : new Cesium.RectangleGeometry({
              // rectangle : Cesium.Rectangle.fromDegrees(-110.0, -20.0, 110.0, 20.0),
              // rectangle : Cesium.Rectangle.fromDegrees(-110.0, 20.0, -80.0, 25.0),
              rectangle : Cesium.Rectangle.fromDegrees( -180.0, -13.43687, 180.0, 13.43687),
              vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
          }),
          attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5))
          }
      });

      // Example 2: Draw a green extruded rectangle.

      // The extrudedHeight option is used to set the height of the
      // extruded side.  The height option is used to specify the distnace
      // from the globe surface to the rectangle.  The rotation
      // option can also be used to rotate the rectangle.
      // var greenRectangleInstance = new Cesium.GeometryInstance({
      //     geometry : new Cesium.RectangleGeometry({
      //         rectangle : Cesium.Rectangle.fromDegrees(-100.0, 30.0, -90.0, 40.0),
      //         rotation : Cesium.Math.toRadians(45),
      //         extrudedHeight : 300000.0,
      //         height : 100000.0,
      //         vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
      //     }),
      //     attributes: {
      //         color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 1.0, 0.0, 0.5))
      //     }
      // });

      // Add both rectangle instances to primitives
      let rectangle = primitives.add(new Cesium.Primitive({
          geometryInstances : [redRectangleInstance],
          appearance : new Cesium.PerInstanceColorAppearance({
              closed : true
          })
      }));
      let p = Cesium.Cartesian3.fromDegrees(-100.0, 30.0, 100000);
      this.addPoint_test(p);
      let M = Cesium.Transforms.eastNorthUpToFixedFrame(p)
      // let rectangleM = Cesium.Matrix4.multiply(rectangle.modelMatrix, M ,new Cesium.Matrix4())
      // console.log('%c [ rectangleM ]-2616', 'font-size:13px; background:pink; color:#bf2c9f;', rectangleM)
      // console.log('%c [ rectangleM ]-2616', 'font-size:13px; background:pink; color:#bf2c9f;', rectangleM[0])
      // console.log('%c [ rectangleM ]-2616', 'font-size:13px; background:pink; color:#bf2c9f;', rectangleM[5])
      // console.log('%c [ rectangleM ]-2616', 'font-size:13px; background:pink; color:#bf2c9f;', rectangleM[10])
      // // rectangleM[0] *= 0.00005
      // rectangleM[5] *= 0.000005
      // rectangleM[10] *= 0.000005
      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(p),
        new Cesium.Cartesian3(0.0, 0.0, 637),
        new Cesium.Matrix4()
      );
      modelMatrix = Cesium.Matrix4.multiplyByScalar(modelMatrix, 0.2, new Cesium.Matrix4())

      rectangle.modelMatrix = modelMatrix;
    },

    // cylinder -- 关于如何让整个圆锥中的 底 不显示颜色；扇面显示颜色且透明。： 目前出了改shader想不到别的办法。
    cylinderPrimitive() {
      var scene = this.viewer.scene;
      var primitives = scene.primitives;

      var solidWhite = Cesium.ColorGeometryInstanceAttribute.fromColor( Cesium.Color.WHITE );

      var length = 200000.0;
      var topRadius = 100000.0;
      var bottomRadius = 0.0;
      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
        Cesium.Transforms.eastNorthUpToFixedFrame(
          // Cesium.Cartesian3.fromDegrees(-70.0, 45.0)
          Cesium.Cartesian3.fromDegrees(-100.0, 40.0)
        ),
        new Cesium.Cartesian3(0.0, 0.0, 100000.0),
        new Cesium.Matrix4()
      );
      var cylinderInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CylinderGeometry({
          length: length,
          topRadius: topRadius,
          bottomRadius: bottomRadius,
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromRandom({
              alpha: 1.0,
            })
          ),
        },
      });
      var cylinderOutlineInstance = new Cesium.GeometryInstance({
        geometry: new Cesium.CylinderOutlineGeometry({
          length: length,
          topRadius: topRadius,
          bottomRadius: bottomRadius,
        }),
        modelMatrix: modelMatrix,
        attributes: {
          color: solidWhite,
        },
      });
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            cylinderInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }),
        })
      );
      primitives.add(
        new Cesium.Primitive({
          geometryInstances: [
            cylinderOutlineInstance,
          ],
          appearance: new Cesium.PerInstanceColorAppearance({
            flat: true,
            translucent: false,
            renderState: {
              lineWidth: Math.min(4.0, scene.maximumAliasedLineWidth),
            },
          }),
        })
      );
    },



    // Math Function
    CurveByBezier() {
      // 三个控制点的： reference link: https://www.cnblogs.com/s313139232/p/12804809.html
      // 四个控制点的： 来自C端杰哥
      // 用哪个：四个控制点做出来的图形更准一些。用4个控制点的。

      let that_ = this;
      let Bezier3Fn_OK = () => {
        // 贝塞尔曲线二维转三维  返回一个三维点数组
        // 参数： x1,y1,x2,y2,h 两点经纬度坐标和飞线高度
        function getBSRPoints(x1, y1, x2, y2, h) {
          let t = 0.5;
          let point1 = [y1, 0]
          let point2 = [y2*(1-t)+y1*t, h]// 这个是为了找到当前贝塞尔曲线的曲线外的参考点，从而形成想要的贝塞尔曲线
          let point3 = [y2, 0]
          let arr = getBSR(point1, point2, point3)
          let arr3d = []
          for (let i in arr) {
            let x = (x2-x1)*(arr[i][0]-y1)/(y2-y1) + x1
            arr3d.push([x, arr[i][0], arr[i][1]])
          }
          return arr3d
        }
        // 生成贝塞尔曲线 （此时是二维的，所处的平面位于 World坐标系中的 YZ平面
        function getBSR (point1, point2, point3) {
          var ps = [{ x: point1[0], y: point1[1] }, { x: point2[0], y: point2[1] }, { x: point3[0], y: point3[1] }]
          let BezierInYZ = CreateBezierPoints(ps, 100);
          return BezierInYZ
        }
        // 贝赛尔曲线算法
        // 参数：
        // anchorpoints: [{ x: 116.30, y: 39.60 }, { x: 37.50, y: 40.25 }, { x: 39.51, y: 36.25 }]
        function CreateBezierPoints(anchorpoints, pointsAmount) {
          var points = [];
          for (var i = 0; i < pointsAmount; i++) {
            var point = MultiPointBezier(anchorpoints, i / pointsAmount)
            points.push([point.x, point.y]);
          }
          return points;
        }
        function MultiPointBezier(points, t) {
          var len = points.length;
          var x = 0, y = 0;
          var erxiangshi = function (start, end) {
            var cs = 1, bcs = 1;
            while (end > 0) {
              cs *= start;
              bcs *= end;
              start--;
              end--;
            }
            return (cs / bcs);
          };
          for (var i = 0; i < len; i++) {
            var point = points[i];
            x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
            y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
          }
          return { x: x, y: y };
        }
        function getBSRxyz (x1,y1,x2,y2,h) {
          let arr3d = getBSRPoints(x1, y1, x2, y2, h);

          that_.addPoint_test(arr3d);
          let arrAll = []
          for (let i in arr3d) {
            arrAll.push(arr3d[i][0])
            arrAll.push(arr3d[i][1])
            arrAll.push(arr3d[i][2])
          }
          return arrAll
        }
        // (0,0) (0.6,0.2) // in  clip space
        // getBSRxyz(0, 0, 0.6, 0.2, 0.3)
        // 精度和纬度  台湾：(120.0，22.0)  北京( 116.40, 39.90 )
        getBSRxyz(120.0, 22.0, 120.0, 39.90, 500000);//定义好的曲线

      }
      Bezier3Fn_OK()

      // 找到曲线上的合适的点
      let p1 = new Cesium.Cartesian3.fromDegrees(120.0, 22.0);
      let p2 = new Cesium.Cartesian3.fromDegrees(120.0, 24.95,500000); // 这个中间的点不在 曲线上，但是确实影响了曲线的走向
      let p4 = new Cesium.Cartesian3.fromDegrees(120.0, 28.95,800000); // 这个中间的点不在 曲线上，但是确实影响了曲线的走向
      let p3 = new Cesium.Cartesian3.fromDegrees(120.0, 39.90);
      that_.addSinglePoint_test(p1,Cesium.Color.RED);
      that_.addSinglePoint_test(p2,Cesium.Color.RED);
      that_.addSinglePoint_test(p3,Cesium.Color.RED);
      that_.addSinglePoint_test(p4,Cesium.Color.RED);

      // By p = t * p1 + (1-t) * p2;// 下面这个方法不好用 -- 3个控制点的话，还是用上面的方法吧
      let Bezier3Fn = (p1, p2, p3) => {
        let t = 0;
        let len = 100;
        let points = [];
        // 需要在 clip space 里面处理好然后平移过来
        // let M1 = Cesium.Transforms.eastNorthUpToFixedFrame(p1);// 此时 p1 为准
        // let p1_n = Cesium.Cartesian3.normalize(p1, new Cesium.Cartesian3());
        // p1_n = Cesium.Matrix4.multiplyByPoint(M1,p1_n,new Cesium.Cartesian3());
        // let p2_n = Cesium.Cartesian3.normalize(p2, new Cesium.Cartesian3());
        // p2_n = Cesium.Matrix4.multiplyByPoint(M1, p2_n, new Cesium.Cartesian3());
        // let p3_n = Cesium.Cartesian3.normalize(p3, new Cesium.Cartesian3());
        // p3_n = Cesium.Matrix4.multiplyByPoint(M1, p3_n, new Cesium.Cartesian3());

        for (let i = 0; i < len; i++){
          t = i / len;

          // p1 = Cesium.Cartesian3.multiplyByScalar(p1_n,t,new Cesium.Cartesian3());
          // p2 = Cesium.Cartesian3.multiplyByScalar(p2_n, 1- t,new Cesium.Cartesian3());

          // P = (1−t)2P1 + 2(1−t)tP2 + t2P3 -- 完全依照公式--不好使
          // let x = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * p2.x + t * t * p3.x;
          // let y = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * p2.y + t * t * p3.y;
          // let z = (1 - t) * (1 - t) * p1.z + 2 * (1 - t) * p2.z + t * t * p3.z;
          // 根据 C 端 4个控制点的公司推写一个 -- 不好使，但是改哪里也不清楚，主要是不知道咋来的
          let x = p1.x + t * ( -2 * p1.x + 2 * p2.x + t * ( 2 * p1.x  - 4 * p2.x + 2 * p3.x )) ;
          let y = p1.y + t * ( -2 * p1.y + 2 * p2.y + t * ( 2 * p1.y  - 4 * p2.y + 2 * p3.y )) ;
          let z = p1.z + t * ( -2 * p1.z + 2 * p2.z + t * ( 2 * p1.z  - 4 * p2.z + 2 * p3.z )) ;


          // P = (1-t)P1 + tP2
          // let x = (1 - t) * p1.x + t * p3.x;
          // let y = (1 - t) * p1.y + t * p3.y;
          // let z = (1 - t) * p1.z + t * p3.z;

          let point = new Cesium.Cartesian3.fromElements(x, y, z);

          points.push(point);
        }

        that_.addPoint_test(points);
      }
      // Bezier3Fn(p1,p2,p3)

      // 尝试 4个控制点的 贝塞尔曲线，from C端 --- OK
      let Bezier4Fn = (p1, p2, p3, p4, len = 100) => {
        let t = 0;
        let points = [];

        for (let i = 0; i < len; i++){
          t = i / len;

          let x = p1.x + t * (-3 * p1.x + 3 * p2.x + t * (3 * p1.x - 6 * p2.x + 3 * p3.x + t * (-p1.x + 3 * p2.x - 3 * p3.x + p4.x)));
          let y = p1.y + t * (-3 * p1.y + 3 * p2.y + t * (3 * p1.y - 6 * p2.y + 3 * p3.y + t * (-p1.y + 3 * p2.y - 3 * p3.y + p4.y)));
          let z = p1.z + t * (-3 * p1.z + 3 * p2.z + t * (3 * p1.z - 6 * p2.z + 3 * p3.z + t * (-p1.z + 3 * p2.z - 3 * p3.z + p4.z)));

          let point = new Cesium.Cartesian3.fromElements(x, y, z);

          points.push(point);
        }

        this.addPoint_test(points);
      }
      // Bezier4Fn(p1, p2, p4,p3)

    },

    pointRotateAroundPoint() {

      let p1 = new Cesium.Cartesian3.fromDegrees(120.0, 20.0);//
      let p2 = new Cesium.Cartesian3.fromDegrees(120.0, 25.0, 400000); // middle of 1 , midOf14

      let disp1p2 = Cesium.Cartesian3.distance(p2, p1);

      this.addSinglePoint_test(p1,Cesium.Color.RED);
      this.addSinglePoint_test(p2, Cesium.Color.RED);

      let M1 = Cesium.Transforms.eastNorthUpToFixedFrame(p1);
      // let M1Inverse = Cesium.Matrix4.inverse(M1, new Cesium.Matrix4());
      let M2 = Cesium.Transforms.eastNorthUpToFixedFrame(p2);
      // let M2Inverse = Cesium.Matrix4.inverse(M2, new Cesium.Matrix4());
      showAxis( { modelMatrix: M1 }, this.viewer.scene, 2000000 );
      showAxis( { modelMatrix: M2 }, this.viewer.scene, 2000000 );

      let degreePerTime = 10;
      // let rotateDisPerTime = 2 * disp1p2 * Math.sin(degreePerTime)  //2Rsina 弦长公式
      let rotateDisPerTime = -disp1p2  //2Rsina 弦长公式
      // let rotateDisPerTime = 100  //2Rsina 弦长公式


      // 最终是绕着 p1 所对应的 ENU 中的 Up 轴进行旋转 ---》
      // 先得到都在 p1 坐标的ENU里面的点，
      let fromCamera = () => {
        // 把 camera position 类比成 p2 ，都绕着 p1 旋转
        // about transform by Matrix
        // this.positionWC ： the position of the camera in world coordinates.
        // this.upWC：        the up direction of the camera in world coordinates.
        // this.directionWC： the view direction of the camera in world coordinates.
        // var position = Cartesian3.clone(this.positionWC, setTransformPosition);
        // var up = Cartesian3.clone(this.upWC, setTransformUp);
        // var direction = Cartesian3.clone(this.directionWC, setTransformDirection);
        var position = p2;
        var up = Cesium.Cartesian3.normalize(
          Cesium.Matrix4.multiplyByPoint(M2, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        );
        var direction = Cartesian3.clone(this.directionWC, setTransformDirection);// 这个 direction 如何确定的？？？？

        let targetM = M1;
        let actualInvTransform = new Cesium.Matrix4()
        Matrix4.inverseTransformation(targetM, actualInvTransform)
        // Matrix4.clone(transform, this._transform);
        // this._transformChanged = true;
        // updateMembers(this);// 干了什么: 根据 更改后的 transform，更新 camera._viewMatrix。 期间更改了：只有 transformChanged，引起了 camera._invTransform，camera._actualTransform， camera._actualInvTransform， camera._modeChanged = false; 的变化
        // Matrix4.multiply( camera._viewMatrix, camera._actualInvTransform, camera._viewMatrix );
        Matrix4.multiply( M2, actualInvTransform, M2 );

        var inverse = actualInvTransform;
        Matrix4.multiplyByPoint(inverse, position, position);
        Matrix4.multiplyByPointAsVector(inverse, direction, this.direction);
        Matrix4.multiplyByPointAsVector(inverse, up, this.up);
        Cartesian3.cross(this.direction, this.up, this.right);

        updateMembers(this);

        // about transform by offset, nothing about transform by Matrix below
        let aboutOffest = () => {
          var offset = {
            heading: 10,
            pitch: 10,
            range: 10
          };// 可以没有
          var position = new Cesium.Cartesian3();
          var direction = new Cesium.Cartesian3();
          var right = new Cesium.Cartesian3();
          var up = new Cesium.Cartesian3();
          var scratchLookAtHeadingPitchRangeOffset = new Cesium.Cartesian3();
          var scratchLookAtHeadingPitchRangeQuaternion1 = new Cesium.Quaternion();
          var scratchLookAtHeadingPitchRangeQuaternion2 = new Cesium.Quaternion();
          var scratchHeadingPitchRangeMatrix3 = new Cesium.Matrix3();

          function offsetFromHeadingPitchRange(heading, pitch, range) {
            pitch = Cesium.Math.clamp(
              pitch,
              -Cesium.Math.PI_OVER_TWO,
              Cesium.Math.PI_OVER_TWO
            );
            heading = Cesium.Math.zeroToTwoPi(heading) - Cesium.Math.PI_OVER_TWO;
            var pitchQuat = Cesium.Quaternion.fromAxisAngle(
              Cesium.Cartesian3.UNIT_Y,
              -pitch,
              scratchLookAtHeadingPitchRangeQuaternion1
            );
            var headingQuat = Cesium.Quaternion.fromAxisAngle(
              Cesium.Cartesian3.UNIT_Z,
              -heading,
              scratchLookAtHeadingPitchRangeQuaternion2
            );
            var rotQuat = Cesium.Quaternion.multiply(headingQuat, pitchQuat, headingQuat);
            var rotMatrix = Cesium.Matrix3.fromQuaternion(
              rotQuat,
              scratchHeadingPitchRangeMatrix3
            );
            var offset = Cesium.Cartesian3.clone(
              Cesium.Cartesian3.UNIT_X,
              scratchLookAtHeadingPitchRangeOffset
            );

            Cesium.Matrix3.multiplyByVector(rotMatrix, offset, offset);
            Cesium.Cartesian3.negate(offset, offset);
            Cesium.Cartesian3.multiplyByScalar(offset, range, offset);
            return offset;
          }
          var cartesianOffset = offsetFromHeadingPitchRange(offset.heading, offset.pitch, offset.range);

          Cesium.Cartesian3.clone(cartesianOffset, position);//  cartesianOffset -->  this.position(is result)
          Cesium.Cartesian3.negate(position, direction);//  this.position -->  this.direction(is result)
          Cesium.Cartesian3.normalize(direction, direction);
          Cesium.Cartesian3.cross(direction, Cesium.Cartesian3.UNIT_Z, right);

          if (Cesium.Cartesian3.magnitudeSquared(right) < Cesium.Math.EPSILON10) {
            Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X, right);
          }

          Cesium.Cartesian3.normalize(right, right);
          Cesium.Cartesian3.cross(right, direction, up);
          Cesium.Cartesian3.normalize(up, up);
        }
      }

      let fromBlogByOmarShehata = () => {
        /*
          If you just have two points, and you want to rotate one relative to the other,
          I think you’ll need to construct a matrix that translates the point such that the origin becomes your point of reference,
          rotates, then translates back.
        */
      }


    },

    // for test
    addPolyline_test(position, color = Cesium.Color.YELLOW) {
      this.viewer.entities.add({
        polyline: {
          positions: position, //Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]),
          width: 5,
          material: color,
          // clampToGround: true,
        },
      });
    },
    addPoint_test(positions) {// positions - <Cartesian3>Array
      var points = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      if (positions[0] instanceof Cesium.Cartesian3) {
        for (let i = 0; i < positions.length; i++){
          points.add({
            position: positions[i],
            color: Cesium.Color.YELLOW,
            size:100,
          });
        }
      } else {
        for (let i = 0; i < positions.length; i++){
          points.add({
            position: new Cesium.Cartesian3.fromDegrees(positions[i][0],positions[i][1],positions[i][2]),
            color: Cesium.Color.YELLOW,
            size:100,
          });
        }
      }
    },
    addSinglePoint_test(position,color=Cesium.Color.YELLOW) {// positions - <Cartesian3>Array
      var points = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
      let point = points.add({
      position: position,
        color: color,
        size:10,
      });
      return point;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#cesiumContainer {
  height: 100vh;
  width: 100vw;
}
</style>
