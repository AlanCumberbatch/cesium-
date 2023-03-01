<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
// import "./css/main.css";

export default {
  name: 'CesiumViewer',
  props: {
    msg: String
  },
  data() {
    return {
      viewer:null,
    }
  },
  mounted() {

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo';

    // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
    // const viewer = new Cesium.Viewer('cesiumContainer', {
    //   terrainProvider: Cesium.createWorldTerrain()
    // });
    var viewer = new Cesium.Viewer('cesiumContainer',{
      shouldAnimate:false,
      geocoder:false,
      homeButton:false,
      animation:false,
      sceneModePicker:false,
      projectionPicker:false,
      animation:false,
      timeline:false,
      infoBox:false,
      // searchButton:false,
      // imageryLayers:false,
      navigationHelpButton:false,
      terrainProvider: Cesium.createWorldTerrain(),
      scene3DOnly:true,
    });
    this.viewer = viewer;

    // this.Tutorials1_Create_Cube(viewer);
    this.Tutorials2_Custom_Material(viewer);
    // this.Tutorials3_Custom_Appearance(viewer);
    // this.Tutorials4_Custom_Primitive(viewer);
    // this.Tutorials5_Radar_Effect(viewer);

    // var scene = viewer.scene;
    // var camera = scene.camera;
    // // Add Cesium OSM Buildings, a global 3D buildings layer. --- 为建筑添加虚拟模型，OSM Buildings 有官网
    // const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());
    // // Fly the camera to San Francisco at the given longitude, latitude, and height.
    // viewer.camera.flyTo({
    //   destination : Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
    //   orientation : {
    //     heading : Math.toRadians(0.0),
    //     pitch : Math.toRadians(-15.0),
    //   }
    // });

  },
  methods: {
    Tutorials1_Create_Cube(viewer) {

            var boxLength = 100000.0;
            var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5*boxLength);
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
                ...v2, ...v3, ...v4, ...v7,
                // 前 -y
                ...v2, ...v3, ...v0, ...v1,
                // 后 +y
                ...v4, ...v7, ...v6, ...v5,
                // 左 -x
                ...v7, ...v2, ...v1, ...v6,
                // 右 +x
                ...v3, ...v4, ...v5, ...v0,
                // 上 +z
                ...v1, ...v0, ...v5, ...v6,
            ];
            // 乘上box的长度
            var boxVertex = rawVertex.map(function(v) {
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
                ...nnz, ...nnz, ...nnz, ...nnz,
                // 前 -y
                ...nny, ...nny, ...nny, ...nny,
                // 后 +y
                ...npy, ...npy, ...npy, ...npy,
                // 左 -x
                ...nnx, ...nnx, ...nnx, ...nnx,
                // 右 +x
                ...npx, ...npx, ...npx, ...npx,
                // 上 +z
                ...npz, ...npz, ...npz, ...npz,
            ]);

            // 3 定义纹理数组
            var sts = new Float32Array([
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
                0, 0, 1, 0, 1, 1, 0, 1,
            ]);

            // 4 定义索引
            var indices = new Uint16Array([
                0, 1, 2, 0, 2, 3,
                4, 5, 6, 4, 6, 7,
                8, 9, 10, 8, 10, 11,
                12, 13, 14, 12, 14, 15,
                16, 17, 18, 16, 18, 19,
                20, 21, 22, 20, 22, 23,
            ]);

            // 5 创建Primitive
            var myBox = viewer.scene.primitives.add(new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.Geometry({
                        attributes: {
                            position: new Cesium.GeometryAttribute({
                                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                                componentsPerAttribute: 3,
                                values: positions
                            }),
                            normal: new Cesium.GeometryAttribute({
                                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                componentsPerAttribute: 3,
                                values: normals
                            }),
                            st: new Cesium.GeometryAttribute({
                                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                componentsPerAttribute: 2,
                                values: sts
                            }),
                        },
                        indices: indices,
                        primitiveType: Cesium.PrimitiveType.TRIANGLES,
                        boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
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
                    material: Cesium.Material.fromType('Image', {
                        image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
                    }),
                    //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
                    closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
                }),
                modelMatrix: modelMatrix,
                asynchronous: false
            }));

            viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000)); //Sandcastle_End
    },

    Tutorials2_Custom_Material(viewer) {

      var boxLength = 100000.0;
      var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5*boxLength);
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
          ...v2, ...v3, ...v4, ...v7,
          // 前 -y
          ...v2, ...v3, ...v0, ...v1,
          // 后 +y
          ...v4, ...v7, ...v6, ...v5,
          // 左 -x
          ...v7, ...v2, ...v1, ...v6,
          // 右 +x
          ...v3, ...v4, ...v5, ...v0,
          // 上 +z
          ...v1, ...v0, ...v5, ...v6,
      ];
      // 乘上box的长度
      var boxVertex = rawVertex.map(function(v) {
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
          ...nnz, ...nnz, ...nnz, ...nnz,
          // 前 -y
          ...nny, ...nny, ...nny, ...nny,
          // 后 +y
          ...npy, ...npy, ...npy, ...npy,
          // 左 -x
          ...nnx, ...nnx, ...nnx, ...nnx,
          // 右 +x
          ...npx, ...npx, ...npx, ...npx,
          // 上 +z
          ...npz, ...npz, ...npz, ...npz,
      ]);

      // 3 定义纹理数组
      var sts = new Float32Array([
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
      ]);

      // 4 定义索引
      var indices = new Uint16Array([
          0, 1, 2, 0, 2, 3,
          4, 5, 6, 4, 6, 7,
          8, 9, 10, 8, 10, 11,
          12, 13, 14, 12, 14, 15,
          16, 17, 18, 16, 18, 19,
          20, 21, 22, 20, 22, 23,
      ]);

      // 5 创建Primitive
      var myBox = viewer.scene.primitives.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.Geometry({
                  attributes: {
                      position: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                          componentsPerAttribute: 3,
                          values: positions
                      }),
                      normal: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.FLOAT,
                          componentsPerAttribute: 3,
                          values: normals
                      }),
                      st: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.FLOAT,
                          componentsPerAttribute: 2,
                          values: sts
                      }),
                  },
                  indices: indices,
                  primitiveType: Cesium.PrimitiveType.TRIANGLES,
                  boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
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
              material: Cesium.Material.fromType('Image', {
                  image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
              }),
              //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
              closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
          }),
          modelMatrix: modelMatrix,
          asynchronous: false
      }));

      viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000));

      // 6 创建material
      // 6.1 创建纯色material
      var colorMaterial = new Cesium.Material({
          fabric: {
              type: 'Color',
              uniforms: {
                  color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
              },
              components: {
                  diffuse: 'color.bgr',
                  alpha: 'color.a'
              }
          },
          translucent: false
      });

      // 6.2 创建图像material
      var imageMaterial = new Cesium.Material({
          fabric: {
              type: 'Image',
              uniforms: {
                  image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
                  repeat: new Cesium.Cartesian2(1.0, 1.0),
                  color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
              },
              components: {
                  diffuse: 'texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb',
                  alpha: 'texture2D(image, fract(repeat * materialInput.st)).a * color.a'
              }
          },
          translucent: false
      });

      // 6.3 创建组合material
      // Material创建几个material来组合使用，以下其写法
      var compositeMaterial = new Cesium.Material({
          fabric: {
              type: 'OurMappedPlastic',
              materials: {
                  diffuseMaterial: {
                      type: 'DiffuseMap',
                      uniforms: {
                          image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
                      }
                  },
                  alphaMap: {
                      type: 'AlphaMap',
                      uniforms: {
                          image: '../../SampleData/models/CesiumBalloon/FlameGrate.png',
                          channel: 'r'
                      }
                  }
              },
              components: {
                  diffuse: 'diffuseMaterial.diffuse',
                  // specular: 'specularMaterial.specular',
                  // alpha: 'diffuseMaterial.diffuse.g',
                  alpha: 'alphaMap.alpha * 3.0',
              },
          },
          translucent: function(material) {
              // return material.uniforms.color.alpha < 1.0;
              return false;
          }
      });

      // 6.4 创建自定义shader的material
      // 模拟纯色到图像的过渡过程
      var customMaterial = new Cesium.Material({
          fabric: {
              type: 'MyCustomShader1',
              uniforms: {
                  image: './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
                  color: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
                  cellAlpha: 0.3
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
                      `
          },
          translucent: false
      });

      var options = [{
          text: '使用纯色材质',
          onselect: function() {
              myBox.appearance.material = colorMaterial;
          }
      }, {
          text: '使用图像材质',
          onselect: function() {
              myBox.appearance.material = imageMaterial;
          }
      }, {
          text: '使用组合材质',
          onselect: function() {
              myBox.appearance.material = compositeMaterial;
          }
      }, {
          text: '自定义Shader材质',
          onselect: function() {
              myBox.appearance.material = customMaterial;
          }
      }];

      // options[0].onselect();//'使用纯色材质'
      // options[1].onselect();//'使用图像材质'
      // options[2].onselect();//'使用组合材质'
      options[3].onselect();//'自定义Shader材质'

    },

    //  czm_phong 这个方法不可用现在：2022.09.19 当前项目中Cesium版本"^1.86.1",
    Tutorials3_Custom_Appearance(viewer) {

      var boxLength = 100000.0;
      var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5*boxLength);
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
          ...v2, ...v3, ...v4, ...v7,
          // 前 -y
          ...v2, ...v3, ...v0, ...v1,
          // 后 +y
          ...v4, ...v7, ...v6, ...v5,
          // 左 -x
          ...v7, ...v2, ...v1, ...v6,
          // 右 +x
          ...v3, ...v4, ...v5, ...v0,
          // 上 +z
          ...v1, ...v0, ...v5, ...v6,
      ];
      // 乘上box的长度
      var boxVertex = rawVertex.map(function(v) {
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
          ...nnz, ...nnz, ...nnz, ...nnz,
          // 前 -y
          ...nny, ...nny, ...nny, ...nny,
          // 后 +y
          ...npy, ...npy, ...npy, ...npy,
          // 左 -x
          ...nnx, ...nnx, ...nnx, ...nnx,
          // 右 +x
          ...npx, ...npx, ...npx, ...npx,
          // 上 +z
          ...npz, ...npz, ...npz, ...npz,
      ]);

      // 3 定义纹理数组
      var sts = new Float32Array([
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
          0, 0, 1, 0, 1, 1, 0, 1,
      ]);

      // 4 定义索引
      var indices = new Uint16Array([
          0, 1, 2, 0, 2, 3,
          4, 5, 6, 4, 6, 7,
          8, 9, 10, 8, 10, 11,
          12, 13, 14, 12, 14, 15,
          16, 17, 18, 16, 18, 19,
          20, 21, 22, 20, 22, 23,
      ]);

      // 5 自定义Appearance
      class VtxfAppearance extends Cesium.Appearance {
          constructor(options) {
              super(options);

              options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

              var translucent = this.translucent;
              var closed = this.closed;

              var defaultVertexShader = `
              attribute vec3 position3DHigh;
              attribute vec3 position3DLow;
              attribute vec3 normal;
              attribute vec2 st;
              attribute float batchId;

              varying vec3 v_positionEC;
              varying vec3 v_normalEC;
              varying vec2 v_st;

              void main()
              {
                  vec4 p = czm_computePosition();

                  v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                  v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                  v_st = st;

                  gl_Position = czm_modelViewProjectionRelativeToEye * p;
              }
              `;

              var defaultFragmentShader = `
              varying vec3 v_positionEC;
              varying vec3 v_normalEC;
              varying vec2 v_st;

              uniform sampler2D myImage;

              void main()
              {
                  vec3 positionToEyeEC = -v_positionEC;

                  vec3 normalEC = normalize(v_normalEC);
              #ifdef FACE_FORWARD
                  normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
              #endif

                  czm_materialInput materialInput;
                  materialInput.normalEC = normalEC;
                  materialInput.positionToEyeEC = positionToEyeEC;
                  materialInput.st = v_st;

                  //czm_material material = czm_getMaterial(materialInput);
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  material.diffuse = texture2D(myImage, materialInput.st).rgb;

              #ifdef FLAT
                  gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
              #else
                  gl_FragColor = czm_phong(normalize(positionToEyeEC), material);
              #endif
              }
              `;
              this._vertexShaderSource = Cesium.defaultValue(options.vertexShaderSource, defaultVertexShader);
              this._fragmentShaderSource = Cesium.defaultValue(options.fragmentShaderSource, defaultFragmentShader);
              this._renderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, options.renderState);

              this.uniforms = Cesium.defaultValue(options.uniforms, {});
          }
      }

      var myAppearance = new VtxfAppearance({
        //faceForward : true // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
        closed: true, // 是否为封闭体，实际上执行的是是否进行背面裁剪
        translucent: false,
        uniforms: {
            myImage: viewer.scene.context.defaultTexture
        }
      });

      // 5.1 加载纹理
      // var imageUri = '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
      var imageUri = './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
      Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function (image) {
          console.log('image loaded!');
          var texture;
          var context = viewer.scene.context;
          if (Cesium.defined(image.internalFormat)) {
              texture = new Cesium.Texture({
                  context : context,
                  pixelFormat : image.internalFormat,
                  width : image.width,
                  height : image.height,
                  source : {
                      arrayBufferView : image.bufferView
                  }
              });
          } else {
              texture = new Cesium.Texture({
                  context : context,
                  source : image
              });
          }

          myAppearance.uniforms.myImage = texture;
      });

      // 6 创建Primitive
      var myBox = viewer.scene.primitives.add(new Cesium.Primitive({
          geometryInstances: new Cesium.GeometryInstance({
              geometry: new Cesium.Geometry({
                  attributes: {
                      position: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                          componentsPerAttribute: 3,
                          values: positions
                      }),
                      normal: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.FLOAT,
                          componentsPerAttribute: 3,
                          values: normals
                      }),
                      st: new Cesium.GeometryAttribute({
                          componentDatatype: Cesium.ComponentDatatype.FLOAT,
                          componentsPerAttribute: 2,
                          values: sts
                      }),
                  },
                  indices: indices,
                  primitiveType: Cesium.PrimitiveType.TRIANGLES,
                  boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
              }),
          }),
          appearance: myAppearance,
          modelMatrix: modelMatrix,
          asynchronous: false
      }));

      viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000));

      //Sandcastle_End
      // Sandcastle.finishedLoading();
    },
    //  czm_phong 这个方法不可用现在：2022.09.19 当前项目中Cesium版本"^1.86.1",
    Tutorials4_Custom_Primitive(viewer) {

        // 1 自定义Primitive
        class VtxfPrimitive {
            constructor(modelMatrix) {
                // 1.0 立方体顶点位置标号，以及坐标系示意图
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

                // 1.1 定义位置数组
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
                    ...v2, ...v3, ...v4, ...v7,
                    // 前 -y
                    ...v2, ...v3, ...v0, ...v1,
                    // 后 +y
                    ...v4, ...v7, ...v6, ...v5,
                    // 左 -x
                    ...v7, ...v2, ...v1, ...v6,
                    // 右 +x
                    ...v3, ...v4, ...v5, ...v0,
                    // 上 +z
                    ...v1, ...v0, ...v5, ...v6,
                ];
                var positions = new Float64Array(rawVertex);

                // 1.2 定义法向数组
                var npx = [1, 0, 0];
                var nnx = [-1, 0, 0];
                var npy = [0, 1, 0];
                var nny = [0, -1, 0];
                var npz = [0, 0, 1];
                var nnz = [0, 0, -1];
                var normals = new Float32Array([
                    // 下 -z
                    ...nnz, ...nnz, ...nnz, ...nnz,
                    // 前 -y
                    ...nny, ...nny, ...nny, ...nny,
                    // 后 +y
                    ...npy, ...npy, ...npy, ...npy,
                    // 左 -x
                    ...nnx, ...nnx, ...nnx, ...nnx,
                    // 右 +x
                    ...npx, ...npx, ...npx, ...npx,
                    // 上 +z
                    ...npz, ...npz, ...npz, ...npz,
                ]);

                // 1.3 定义纹理数组
                var sts = new Float32Array([
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    0, 0, 1, 0, 1, 1, 0, 1,
                ]);

                // 1.4 定义索引
                var indices = new Uint16Array([
                    0, 1, 2, 0, 2, 3,
                    4, 5, 6, 4, 6, 7,
                    8, 9, 10, 8, 10, 11,
                    12, 13, 14, 12, 14, 15,
                    16, 17, 18, 16, 18, 19,
                    20, 21, 22, 20, 22, 23,
                ]);

                // 1.5 定义纹理
                var texture = undefined;
                // var imageUri = '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
                var imageUri = './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
                Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                    console.log('image loaded!');
                    var vtxfTexture;
                    var context = viewer.scene.context;
                    if (Cesium.defined(image.internalFormat)) {
                        vtxfTexture = new Cesium.Texture({
                            context: context,
                            pixelFormat: image.internalFormat,
                            width: image.width,
                            height: image.height,
                            source: {
                                arrayBufferView: image.bufferView
                            }
                        });
                    } else {
                        vtxfTexture = new Cesium.Texture({
                            context: context,
                            source: image
                        });
                    }

                    texture = vtxfTexture;
                });

                // vtxf 使用double类型的position进行计算
                // var attributeLocations = {
                //     position3DHigh : 0,
                //     position3DLow : 1,
                //     normal : 2,
                //     textureCoordinates : 3,
                // };

                // 1.6 定义attributeLocations
                var attributeLocations = {
                    position: 0,
                    normal: 1,
                    textureCoordinates: 2,
                };

                // 1.7 定义shader
                var vtxfVertexShader =
                `
                  // vtxf 使用double类型的position进行计算
                  // attribute vec3 position3DHigh;
                  // attribute vec3 position3DLow;
                  attribute vec3 position;
                  attribute vec3 normal;
                  attribute vec2 st;
                  attribute float batchId;

                  varying vec3 v_positionEC;
                  varying vec3 v_normalEC;
                  varying vec2 v_st;

                  void main()
                  {
                      // vtxf 使用double类型的position进行计算
                      // vec4 p = czm_translateRelativeToEye(position3DHigh, position3DLow);
                      // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                      // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                      // v_st = st;
                      // gl_Position = czm_modelViewProjectionRelativeToEye * p;

                      v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       // position in eye coordinates
                      v_normalEC = czm_normal * normal;                               // normal in eye coordinates
                      v_st = st;
                      gl_Position = czm_modelViewProjection * vec4(position, 1.0);
                  }
                `;

                var vtxfFragmentShader =
                `
                  varying vec3 v_positionEC;
                  varying vec3 v_normalEC;
                  varying vec2 v_st;

                  uniform sampler2D myImage;

                  void main()
                  {
                      vec3 positionToEyeEC = -v_positionEC;

                      vec3 normalEC = normalize(v_normalEC);
                  #ifdef FACE_FORWARD
                      normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
                  #endif

                      czm_materialInput materialInput;
                      materialInput.normalEC = normalEC;
                      materialInput.positionToEyeEC = positionToEyeEC;
                      materialInput.st = v_st;

                      //czm_material material = czm_getMaterial(materialInput);
                      czm_material material = czm_getDefaultMaterial(materialInput);
                      material.diffuse = texture2D(myImage, materialInput.st).rgb;

                  #ifdef FLAT
                      gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
                  #else
                      gl_FragColor = czm_phong(normalize(positionToEyeEC), material);
                  #endif
                  }
                `;

                // 1.8 创建vertexArray
                function createVertexArray(context) {
                    var geometry = new Cesium.Geometry({
                        attributes: {
                        position: new Cesium.GeometryAttribute({
                        // vtxf 使用double类型的position进行计算
                        // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: positions
                        }),
                        normal: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 3,
                        values: normals
                        }),
                        textureCoordinates: new Cesium.GeometryAttribute({
                        componentDatatype: Cesium.ComponentDatatype.FLOAT,
                        componentsPerAttribute: 2,
                        values: sts
                        })
                        },
                        // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
                        indices: indices,
                        primitiveType: Cesium.PrimitiveType.TRIANGLES,
                        boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
                    });

                    var vertexArray = Cesium.VertexArray.fromGeometry({
                        context: context,
                        geometry: geometry,
                        attributeLocations: attributeLocations,
                        bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
                        // interleave : true
                    });

                    return vertexArray;
                };

                // 1.9 创建command
                function createCommand(context) {
                    var translucent = false;
                    var closed = true;
                      // 借用一下Appearance.getDefaultRenderState
                    var rawRenderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, undefined);
                    var renderState = Cesium.RenderState.fromCache(rawRenderState);

                    var vertexShaderSource = new Cesium.ShaderSource({
                        sources: [vtxfVertexShader]
                    });

                    var fragmentShaderSource = new Cesium.ShaderSource({
                        sources: [vtxfFragmentShader]
                    });

                    var uniformMap = {
                        myImage: function() {
                                if (Cesium.defined(texture)) {
                                    return texture;
                                } else {
                                    return context.defaultTexture;
                                }
                        }
                    }

                    var shaderProgram = Cesium.ShaderProgram.fromCache({
                        context: context,
                        vertexShaderSource: vertexShaderSource,
                        fragmentShaderSource: fragmentShaderSource,
                        attributeLocations: attributeLocations
                    });

                    return new Cesium.DrawCommand({
                        vertexArray: createVertexArray(context),
                        primitiveType: Cesium.PrimitiveType.TRIANGLES,
                        renderState: renderState,
                        shaderProgram: shaderProgram,
                        uniformMap: uniformMap,
                        owner: this,
                        // framebuffer : framebuffer,
                        pass: Cesium.Pass.OPAQUE,
                        modelMatrix: modelMatrix,
                    });
                }

                this.show = true;
                this._command = undefined;
                this._createCommand = createCommand;
            }

            update(frameState) {
                if (!this.show) {
                  return;
                }

                if (!Cesium.defined(this._command)) {
                  this._command = this._createCommand(frameState.context);
                }

                if (Cesium.defined(this._command)) {
                  frameState.commandList.push(this._command);
                }
            }

            isDestroyed() {
              return false;
            }

            destroy() {
              if (Cesium.defined(this._command)) {
                  this._command.shaderProgram = this._command.shaderProgram && this._command.shaderProgram.destroy();
              }
              return destroyObject(this);
            };
        }

        // 2 创建Primitive
        var boxLength = 100000.0;
        var position = Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength);
        // var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        var enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        var scaleMatrix = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(boxLength, boxLength, boxLength));
        var modelMatrix = Cesium.Matrix4.multiply(enuMatrix, scaleMatrix, new Cesium.Matrix4());

        var myBox = viewer.scene.primitives.add(new VtxfPrimitive(modelMatrix));

        viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(position, 100000));

    },

    Tutorials5_Radar_Effect(viewer) {

      var scene = viewer.scene;

      // 1 雷达位置计算
      // 1.1 雷达的高度
      var length = 400000.0;
      // 1.2 地面位置(垂直地面)
      var positionOnEllipsoid = Cesium.Cartesian3.fromDegrees(116.39, 39.9);
      // 1.3 中心位置
      var centerOnEllipsoid = Cesium.Cartesian3.fromDegrees(116.39, 39.9, length*0.5);
      // 1.4 顶部位置(卫星位置)
      var topOnEllipsoid = Cesium.Cartesian3.fromDegrees(116.39, 39.9, length);
      // 1.5 矩阵计算
      var modelMatrix = Cesium.Matrix4.multiplyByTranslation(
          Cesium.Transforms.eastNorthUpToFixedFrame(positionOnEllipsoid),
          new Cesium.Cartesian3(0.0, 0.0, length * 0.5), new Cesium.Matrix4()
      );

      // 2 相机飞入特定位置
      viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(centerOnEllipsoid, length));

      // 3 创建卫星
      var imageUri = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjgzLjIzIiBoZWlnaHQ9IjIwNi42NiIgZmlsbC1ydWxlPSJldmVub2RkIiB2aWV3Qm94PSIwIDAgODUwMCAxMTAwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiA8ZGVmcz4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImIiPgogICA8c3RvcCBvZmZzZXQ9IjAiLz4KICAgPHN0b3Agc3RvcC1vcGFjaXR5PSIwIiBvZmZzZXQ9IjEiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0iaCIgeDE9IjQ2NjEiIHgyPSI0MzcxLjkiIHkxPSIyMTYxLjIiIHkyPSIyMzk1LjYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iIzQ1NDU4NSIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNiYWJhZmQiIG9mZnNldD0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJpIiB4MT0iNDY2OS45IiB4Mj0iNDU0My42IiB5MT0iMjI5Ny4xIiB5Mj0iMjU1Ni4xIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiMzYTNhNjMiIG9mZnNldD0iMCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjYmFiYWZkIiBvZmZzZXQ9IjEiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0iayIgeDE9IjU0MDguMiIgeDI9IjU0ODIuNiIgeTE9IjM1ODkuNSIgeTI9IjM5NjAuNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCguMDU0OTA3IC45MzYwMiAuOTM2OTEgLjA3MjA4MyAxNzcuNDMgLTI3MTkpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNkOWQ5ZDkiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmYiIG9mZnNldD0iLjYyOTYzIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNlOWU5ZTkiIHN0b3Atb3BhY2l0eT0iMCIgb2Zmc2V0PSIxIi8+CiAgPC9saW5lYXJHcmFkaWVudD4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImwiIHgxPSI1MzE5LjMiIHgyPSI1MzcxLjIiIHkxPSIzNTA4LjEiIHkyPSIzNTY5LjgiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjE1Mzg2IC45NDkxOCAxLjAyNDMgLjI3MjUzIC02NzIuMzcgLTM1MjUuMSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmYiIG9mZnNldD0iLjUiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iIzBkMDAwMCIgb2Zmc2V0PSIxIi8+CiAgPC9saW5lYXJHcmFkaWVudD4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImEiPgogICA8c3RvcCBvZmZzZXQ9IjAiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ExYTFhMSIgb2Zmc2V0PSIuNSIvPgogICA8c3RvcCBvZmZzZXQ9IjEiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0iZiIgeDE9IjQ2NTguOSIgeDI9IjQ0OTcuOCIgeTE9IjIyODguNSIgeTI9IjI2MzMuNyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjNDU0NTg1IiBvZmZzZXQ9IjAiLz4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgb2Zmc2V0PSIxIi8+CiAgPC9saW5lYXJHcmFkaWVudD4KICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSI1MDY0LjEiIHgyPSI0NzU5LjYiIHkxPSIyMzE4LjkiIHkyPSIyNjA1LjkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iIzUxNTE5YyIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmM2YzZjkiIG9mZnNldD0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJqIiB4MT0iNDY3My4yIiB4Mj0iNDc4Ni40IiB5MT0iMTYyNy4xIiB5Mj0iMTg2NS42IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgIDxzdG9wIG9mZnNldD0iMCIvPgogICA8c3RvcCBzdG9wLWNvbG9yPSIjZmZmYmZiIiBvZmZzZXQ9Ii4yNDA3NCIvPgogICA8c3RvcCBvZmZzZXQ9IjEiLz4KICA8L2xpbmVhckdyYWRpZW50PgogIDxsaW5lYXJHcmFkaWVudCBpZD0ibSIgeDI9IjAiIHkxPSI1MjUxLjciIHkyPSI0NTYwLjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjcwNjMyIC43MDc4OSAuNzA3ODkgLS43MDYzMiAtMjQ3Mi41IDMwOTIuMykiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4bGluazpocmVmPSIjYiIvPgogIDxsaW5lYXJHcmFkaWVudCBpZD0ibiIgeDE9IjQxNTcuNSIgeDI9IjQwNzkuNiIgeTE9IjE3ODYuOCIgeTI9IjIxNDQuNCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCguOTM5NjIgLjY3ODk3IC0uNjc4OTcgLjkzOTYyIDIyODQuNyAtMjk3NS4yKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHhsaW5rOmhyZWY9IiNiIi8+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJvIiB4MT0iNDg1MS43IiB4Mj0iNDg4Ni4yIiB5MT0iMTgzMS4zIiB5Mj0iMTgwMC44IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC4wNzc0NjcgMS4xNTA2IC0xLjE2NjEgLS4yNzA1OCA2MjQyLjIgLTMyMzIuNCkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4bGluazpocmVmPSIjYSIvPgogIDxsaW5lYXJHcmFkaWVudCBpZD0icCIgeDE9IjQ4NDUuNSIgeDI9IjQ4NzUuNCIgeTE9IjE4MjkuNSIgeTI9IjE4MDAuMSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgtLjAwNDg0NTUgLS42MTExOCAtLjcwMjQ0IC4wMDU1NjkxIDU5MjQuNSA0NjE5LjkpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeGxpbms6aHJlZj0iI2EiLz4KICA8bGluZWFyR3JhZGllbnQgaWQ9InEiIHgxPSI0ODQ1LjUiIHgyPSI0ODc1LjQiIHkxPSIxODI5LjUiIHkyPSIxODAwLjEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjg0MjIxIC0uMDU4NTA0IC4wNjcyMzkgLjk2Nzk3IDYwMy42NCAzNjkuNTkpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeGxpbms6aHJlZj0iI2EiLz4KICA8cmFkaWFsR3JhZGllbnQgaWQ9ImMiIGN4PSI1MTAxLjQiIGN5PSIzNzIwIiByPSIzNTMuODIiIGZ4PSI1MDY4LjIiIGZ5PSIzNjUwLjEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLjI2MjYxIDIuMTE0IDEuNTkzNCAuMDgwODQ2IC0zMzMyLjUgLTg3NjEuNSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iIzA1MDEwMSIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiNmZmYiIG9mZnNldD0iMSIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJkIiBjeD0iNTA2My4xIiBjeT0iMzc0Ny41IiByPSIzMjkuMzYiIGZ4PSI1MTMyLjciIGZ5PSIzNjU0LjkiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLS4wNzM5MDMgLS42NzM2NSAtLjU5NTI5IC4wMTE4NTMgNjUxMi41IDU3NDkuOSkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2M2YzZjNiIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiMxYTFhMWEiIG9mZnNldD0iMSIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiAgPHJhZGlhbEdyYWRpZW50IGlkPSJlIiBjeD0iMzk3Ny42IiBjeT0iMjQxNS40IiByPSIxMTkuMTUiIGZ4PSIzOTY0LjQiIGZ5PSIyNDYxLjciIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoLTEuMjczMSAuNDA1ODcgLS4zNzA3MSAtMS4xNjI4IDEwNTU4IDMwMDAuNCkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgb2Zmc2V0PSIwIi8+CiAgIDxzdG9wIHN0b3AtY29sb3I9IiMwNDAwMDAiIG9mZnNldD0iMSIvPgogIDwvcmFkaWFsR3JhZGllbnQ+CiA8L2RlZnM+CiA8ZyB0cmFuc2Zvcm09Im1hdHJpeCg3LjYwNzQgLS4yNTYwNCAuMjU2MDQgNy42MDc0IC0zMzM2MSAtNjY4NC44KSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCguODgzMzMgLjExMDYxIC0uMTY4MzUgLjg3OTQ5IDgyNy4xNCAtMTAxNSkiPgogICA8cGF0aCBkPSJtNDYxMS4yIDI1MDkuOCAyNzYuNTktMTYzLjM0LTQwMi45Mi0yMjAuOTMtMjYzLjA5IDExMS45NyAzODkuNDIgMjcyLjI5eiIgZmlsbD0iIzVlODg5ZCIvPgogICA8cGF0aCBkPSJtNDY0Ny41IDIyMzMuOS0xNjAuNDQtODkuNDM0LTkxLjM4MSA0MS4xMjggMTU1LjQ1IDEwMS4zNSA5Ni4zNy01My4wNDV6bS0zODEuNjMgOS4wMjYgMTYwLjc1IDExMi44NiAxMDYuNDctNTguODI2LTE1Ny4yNC0xMDIuNjYtMTA5Ljk3IDQ4LjYzMXptMjg0LjQgNjUuMTUzLTEwNS4xMiA1OS40MDEgMTY3LjEgMTE2LjA2IDExMC45My02My4yNTQtMTcyLjkxLTExMi4yMXptMTg5LjU5IDEwMS41OSAxMDkuNDktNjMuMjg5LTE4NC4zNS0xMDIuODYtOTYuODY5IDUzLjg1NCAxNzEuNzMgMTEyLjI5eiIgZmlsbD0idXJsKCNoKSIgZmlsbC1ydWxlPSJub256ZXJvIi8+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KC41NzcyNSAuMjYwNDcgLS41NjE4NSAuODY4MDUgMjkyNC4zIC0xOTY3LjQpIj4KICAgPHBhdGggZD0ibTQ2MTEuMiAyNTA5LjggMjc2LjU5LTE2My4zNC0zNzUuMTktMjE5LjY2Yy05LjQwNjYtNC4zODI5LTE1Ljk4Ni01Ljc0LTI4Ljk1LTMuMTUyOGwtMjQ2LjM4IDEwNy4xMmMtNi4zMjY5IDQuMjM1OC02LjI4MiA5LjcyOTItMi4yMjM4IDE2LjAxNWwzNzYuMTUgMjYzLjAxeiIgZmlsbD0iIzNjNjg3ZSIvPgogICA8cGF0aCBkPSJtNDY1MS4zIDIyMzEuOC0xNTMuMzgtOTIuNjc5LTEwMi4xOSA0Ni41NDYgMTU1LjQ1IDEwMS4zNSAxMDAuMTItNTUuMjJ6bS0zODUuMzkgMTEuMjAxIDE2MC43NSAxMTIuODYgMTA2LjQ3LTU4LjgyNi0xNTcuMjQtMTAyLjY2LTEwOS45NyA0OC42MzF6bTI4NC40IDY1LjE1My0xMDUuMTIgNTkuNDAxIDE2Ny4xIDExNi4wNiAxMTAuOTMtNjMuMjU0LTE3Mi45MS0xMTIuMjF6bTE4OS41OSAxMDEuNTkgMTA5LjQ5LTYzLjI4OS0xODAuNi0xMDUuMDQtMTAwLjYyIDU2LjAyOSAxNzEuNzMgMTEyLjI5eiIgZmlsbD0idXJsKCNpKSIgZmlsbC1ydWxlPSJub256ZXJvIi8+CiAgPC9nPgogIDxwYXRoIGQ9Im00NjA0LjggMTY0Ny44Yy0xNi42MjYtMTUuNzU1LTEuMDcyLTI4LjE5IDEzLjc4Ny0xMy40OGwyOC4xNjQgMjAuOTZjMTcuOTM5IDEwLjgwMi01Ljg0OTUgMjguODE0LTE3LjkwNCAyMy4zMTlsLTI2LjQ3OS0yOS4wMzQgMi40MzIxLTEuNzY1eiIgZmlsbD0idXJsKCNwKSIgZmlsbC1ydWxlPSJub256ZXJvIi8+CiAgPHBhdGggZD0ibTQ2NDAuNSAxOTYwLjVjNTguMjkxLTM0LjY4MiA1MC40MTktMTYwLjkxLTUuODEyMi0yMTMuNzktNDMuOTg2LTQxLjcyLTEwMi4xOC01My4zNy0xNDIuODItMzAuNzA3bDMzNy4xOC0xNDkuM2M0NC42NTQtMjMuNTQyIDExNy42Mi0zMS4yNTIgMTY2LjgxIDIxLjE2NCAzMi4wNTYgMzQuMTU4IDQ3LjM2OCAxMjYuMTYtMTkuNjI5IDE3MC4xNGwtMzM1Ljc0IDIwMi41eiIgZmlsbD0idXJsKCNqKSIvPgogIDxwYXRoIGQ9Im00NDgzLjMgMTcyMi44YzQ0LjQtMzQuODE4IDEwMS43My0yNS4zMjkgMTUwLjI5IDIwLjczIDYwLjU3IDU4LjU3MyA3NS4xMzQgMTg4LjEzLTYuNDUyOCAyMjUuMDUtMTIwLjYxIDU0LjU3Mi0yNDYuNzEtMTY1LjExLTE0My44My0yNDUuNzh6IiBmaWxsPSJ1cmwoI2UpIi8+CiAgPHBhdGggZD0ibTQ2NDAuNSAxOTYwLjVjNTguMjkxLTM0LjY4MiA1MC40MTktMTYwLjkxLTUuODEyMi0yMTMuNzktNDMuOTg2LTQxLjcyLTEwMi4xOC01My4zNy0xNDIuODItMzAuNzA3bDMzNy4xOC0xNDkuM2M0NC42NTQtMjMuNTQyIDExNy42Mi0zMS4yNTIgMTY2LjgxIDIxLjE2NCAzMi4wNTYgMzQuMTU4IDQ3LjM2OCAxMjYuMTYtMTkuNjI5IDE3MC4xNGwtMzM1Ljc0IDIwMi41eiIgZmlsbD0idXJsKCNuKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+CiAgPHBhdGggZD0ibTQ0MzYuMyAxODg0LjhjMjEuMTg0IDkuNjYzNCAyNS42MzMgMjUuNDI3IDM1LjE1NiA1Mi4yMDZsODMuODE3LTQ1LjQyOGMyNS43OTktMjMuNTI4LTYuMDY5Mi03MS4wMDMtMzMuNDY4LTYzLjQ3MmwtODUuNTA2IDU2LjY5NHoiIGZpbGw9InVybCgjbykiIGZpbGwtcnVsZT0ibm9uemVybyIvPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMDE5NCAtLjAzODE3OSAtLjAwOTgyNDIgMS4zOTQzIDQwOC45NyAtMTAxMC41KSI+CiAgIDxwYXRoIGQ9Im00NjExLjIgMjUwOS44IDI3Ni41OS0xNjMuMzQtNDAyLjkyLTIyMC45My0yNjMuMDkgMTExLjk3IDM4OS40MiAyNzIuMjl6IiBmaWxsPSIjNWU4ODlkIi8+CiAgIDxwYXRoIGQ9Im00NjU0LjMgMjIzOC4zLTE2Ny4yNS05My43ODktOTEuMzgxIDQxLjEyOCAxNTguODUgMTAzLjEyIDk5Ljc3Ny01MC40NTR6bS0zODguNDQgNC42NzE2IDE2MC43NSAxMTIuODYgMTA4Ljc0LTU1LjQ0MS0xNTkuNTItMTA2LjA1LTEwOS45NyA0OC42MzF6bTI4Ny44MSA2Ni45MTYtMTA4LjUzIDU3LjYzOCAxNjcuMSAxMTYuMDYgMTEwLjkzLTYzLjI1NC0xNjkuNS0xMTAuNDR6bTE4Ni4xOSA5OS44MjggMTA5LjQ5LTYzLjI4OS0xNzQuMTQtOTcuNTcyLTEwMi41NCA1Mi44NSAxNjcuMTggMTA4LjAxeiIgZmlsbD0idXJsKCNmKSIgZmlsbC1ydWxlPSJub256ZXJvIi8+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMTI5MiAuMDQwOTI1IC4xNjA3MiAxLjU0MTcgLTUyMy45NCAtMTc0NC40KSI+CiAgIDxwYXRoIGQ9Im01MDIyLjIgMjYxMC45IDI2MS41LTE4NC40MWM0LjQxOTQtNi4xNTYzLTIuMjgzNS0xMC43MTgtOS4wNjYyLTE0LjEzOWwtMzc5LjU0LTYxLjkwOS0yNzYuMTUgMTY0LjM1IDM4MS4zOCA5OS40NzJjOC4wNzY1IDEuMzAyNSAxNS4zMSAwLjAwODUgMjEuODY5LTMuMzYyMnoiIGZpbGw9IiM2Zjk1YTkiLz4KICAgPHBhdGggZD0ibTUwNTMuMiAyMzkyLjQtMTU2Ljg2LTI3LjY5Ni05Ni4wMjcgNTguODQ4IDE1NC43MiAzNS4xMjggOTguMTYxLTY2LjI4MXptLTM4OS4yNCAxMTMuODkgMTU5LjYgNDIuNjc5IDExMi40My03Ny4xNzUtMTU2LjUtMzUuNjQzLTExNS41MiA3MC4xNHptMjg5LjEzLTMwLjY3OC0xMTEuMDggNzcuMjQxIDE2NS45NiA0My4zNzQgMTE3LjI0LTgxLjk1OC0xNzIuMTMtMzguNjU3em0xODkuODIgMjUuNDU4IDEwOC41OC03NS41OTUtMTc5LjU3LTI5LjY4MS05OS45MTQgNjYuMjEgMTcwLjkxIDM5LjA2NnoiIGZpbGw9InVybCgjZykiIGZpbGwtcnVsZT0ibm9uemVybyIvPgogIDwvZz4KICA8cGF0aCBkPSJtNDgzNS4zIDE4NjcuOGMyMy40NzEgMjEuMjE3IDQxLjExIDAuNzAyNSAxOS4yNjctMTguMTkzbC0zMS44NjgtMzYuNTUxYy0xNi43OS0yMy41NTQtNDEuMjY0IDEwLjc2MS0zMi40MTEgMjYuNzc2bDM1LjM0MyAyNi4xOSAzLjgyODctMS44NTI0IDUuODQxMiAzLjYyOTN6IiBmaWxsPSJ1cmwoI3EpIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz4KICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCguOTk2MzMgLS4wODU1NzIgLjA4NTU3MiAuOTk2MzMgMjYzLjYxIC0zMC40MDQpIj4KICAgPHBhdGggZD0ibTQxNTEuMyAyODAzLjNjOTQuODU3LTI3LjM0MyAyNi4wNTYtMjEzLjc2LTE0OC4yOC00MDMuNjQtMTc1LjE4LTE4OS41OS0zOTcuOTMtMzI4LjA2LTQ4NS41OC0yODUuODMtNzkuNTg0IDM4LjMzOS0yNS4zNzcgMjEyLjM3IDE0OC43MiA0MDIuNDYgMTI5Ljc4IDEzOS40MiAzNjAuMTggMzIzLjA0IDQ4NS4xNCAyODcuMDJ6IiBmaWxsPSJ1cmwoI2MpIi8+CiAgIDxwYXRoIGQ9Im00MTU0LjcgMjc5NmM5NC44NTctMjcuMzQzIDI2Ljg4Ny0xODIuMzItMTMwLjg3LTM4My44OC0xNzUuNDQtMjI0LjE1LTM5Mi42MiA5NC4wNDQtMjU2LjkzIDE5Ni45MSAxMTMuMzQgODUuOTI0IDI2Mi44NCAyMjIuOTkgMzg3LjggMTg2Ljk3eiIgZmlsbD0idXJsKCNrKSIgb3BhY2l0eT0iLjUiLz4KICAgPHBhdGggZD0ibTM5NTAuNiAyMzcxLjRjNC4zOTAxLTUuNDIxMy0yNi45MjEtMzcuNzY4LTM0LjIxNS0zMi40NDRsLTI5OS4xOCAzMjEuMjRjLTExLjY4OSAxMy4wODQgMC43MzA4IDI0LjAzMiAxMi40OTYgMTEuMjc5bDMyMC45LTMwMC4wOHoiIGZpbGw9InVybCgjbCkiLz4KICAgPHBhdGggZD0ibTM1MTcuMyAyMTE0YzEyNC45Ni02Ny4zMiAzMzQuMjcgNC4xNDEgNDY5LjQxIDEyMy4xNiAxNDAuMDUgMTIzLjM0IDI0OS4zNSAzNTMuMyAyMDIuNyA1MjkuNyAyMy4xMzgtNjkuNzExLTQ4LjAyNC0yMTYuNDYtMTg2LjM3LTM2Ny4xNC0xNzUuMTgtMTg5LjU5LTM5Ni4xNy0zMjQuNTEtNDg1LjczLTI4NS43MnoiIGZpbGw9InVybCgjZCkiLz4KICAgPHBhdGggZD0ibTM5NTAuNiAyMzcxLjRjNC4zOTAxLTUuNDIxMy0yNi45MjEtMzcuNzY4LTM0LjIxNS0zMi40NDRsLTI5OS4xOCAzMjEuMjRjLTExLjY4OSAxMy4wODQgMC43MzA4IDI0LjAzMiAxMi40OTYgMTEuMjc5bDMyMC45LTMwMC4wOHoiIGZpbGw9InVybCgjbSkiLz4KICA8L2c+CiA8L2c+Cjwvc3ZnPgo='
      var billboards = scene.primitives.add(new Cesium.BillboardCollection());
      billboards.add({
          // image : './Tutorials/satellite1.svg',
          image : imageUri,
          position : topOnEllipsoid,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(-10, 10),
          scale: 0.3,
      });

      // 4 创建雷达放射波
      // 4.1 先创建Geometry
      var cylinderGeometry = new Cesium.CylinderGeometry({
          length: length,
          topRadius: 0.0,
          bottomRadius: length * 0.5,
          // vertexFormat : Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
          vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat
      });
      // 4.2 创建GeometryInstance
      var redCone = new Cesium.GeometryInstance({
          geometry: cylinderGeometry,
          modelMatrix: modelMatrix,
          // attributes : {
          //     color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED)
          // }
      });
      // 4.3 创建Primitive
      var radar = scene.primitives.add(new Cesium.Primitive({
          geometryInstances: [redCone],
          // appearance : new Cesium.PerInstanceColorAppearance({
          //     closed : true,
          //     translucent: false
          // })
          appearance: new Cesium.MaterialAppearance({
              // 贴图像纹理
              // material: Cesium.Material.fromType('Image', {
              //     image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png'
              // }),

              // 贴棋盘纹理
              // material: Cesium.Material.fromType('Checkerboard'),

              // 自定义纹理
              material: new Cesium.Material({
                  fabric: {
                      type: 'VtxfShader1',
                      uniforms: {
                          color: new Cesium.Color(0.2, 1.0, 0.0, 1.0),
                          repeat: 30.0,
                          offset: 0.0,
                          thickness: 0.3,
                      },
                      source: `
                          uniform vec4 color;
                          uniform float repeat;
                          uniform float offset;
                          uniform float thickness;

                          czm_material czm_getMaterial(czm_materialInput materialInput)
                          {
                              czm_material material = czm_getDefaultMaterial(materialInput);
                              float sp = 1.0/repeat;
                              vec2 st = materialInput.st;
                              float dis = distance(st, vec2(0.5));
                              float m = mod(dis + offset, sp);
                              float a = step(sp*(1.0-thickness), m);

                              material.diffuse = color.rgb;
                              material.alpha = a * color.a;

                              return material;
                          }
                      `
                  },
                  translucent: false
              }),
              faceForward : false, // 当绘制的三角面片法向不能朝向视点时，自动翻转法向，从而避免法向计算后发黑等问题
              closed: true // 是否为封闭体，实际上执行的是是否进行背面裁剪
          }),
      }));

      // 5 动态修改雷达材质中的offset变量，从而实现动态效果。
      viewer.scene.preUpdate.addEventListener(function() {
        var offset = radar.appearance.material.uniforms.offset;
        offset -= 0.001;
        if (offset > 1.0) {
          offset = 0.0;
        }
        radar.appearance.material.uniforms.offset = offset;
      })
    },
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div#cesiumContainer {
    height: 100vh;
    width: 100vw;
  }
</style>
