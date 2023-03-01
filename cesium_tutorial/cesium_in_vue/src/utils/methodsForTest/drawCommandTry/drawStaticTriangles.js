import * as Cesium from 'cesium'
function drawStaticTriangles(viewer, typedArray, stArray, normalsArray, imageUri) {
  // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
  // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
  const modelMatrix = Cesium.Matrix4.IDENTITY;

  // var imageMaterial = new Cesium.Material({
  //     fabric: {
  //         type: 'Image',
  //         uniforms: {
  //             // image: '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png',
  //             image: './imgs/fromShang/Dirlinetexture02.png',
  //             repeat: new Cesium.Cartesian2(1.0, 1.0),
  //             color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
  //         },
  //         components: {
  //             diffuse: 'texture2D(image, fract(repeat * materialInput.st)).rgb * color.rgb',
  //             alpha: 'texture2D(image, fract(repeat * materialInput.st)).a * color.a'
  //         }
  //     },
  //     translucent: false
  // });

  const vertexShaderText = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 st;
  attribute float batchId;

  varying vec3 v_positionEC;
  varying vec3 v_normalEC;
  varying vec2 v_st;

  void main() {
      vec4 p = vec4(position,1.0);

      // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
      v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
      v_normalEC = czm_normal * normal;                         // normal in eye coordinates
      v_st = st;

      // v_normal = czm_normal;// * normal;
      // v_normalEC = normal;
      // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

      // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
      gl_Position = czm_projection * czm_view * czm_model * p;
      // gl_Position = czm_modelViewProjectionRelativeToEye * p;
  }`;

  /*
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
          material.alpha = color.a * aa;
          // material.alpha = 1.0;

          return material;
      }
  */
  const fragmentShaderText = `
  uniform vec4 u_color;
  uniform vec2 u_repeat;
  uniform sampler2D myImage;

  varying vec3 v_positionEC;
  varying vec2 v_st;

  void main(){
      czm_materialInput materialInput;
      materialInput.positionToEyeEC = v_positionEC;
      materialInput.st = v_st;

      czm_material material = czm_getDefaultMaterial(materialInput);

      // vec2 st = materialInput.st;
      // float aa = st.s * st.t;
      // vec3 halfColor = u_color.rgb * aa + texture2D(myImage, materialInput.st).rgb * (1.0 - aa);
      // // vec3 halfColor = texture2D(myImage, materialInput.st).rgb;
      // halfColor *= 0.5;
      // material.diffuse = halfColor;
      // material.emission = halfColor;
      // material.alpha = aa;

      material.diffuse = texture2D(myImage, fract(u_repeat * materialInput.st)).rgb * u_color.rgb;
      material.alpha = texture2D(myImage, fract(u_repeat * materialInput.st)).a * 1.0;

      gl_FragColor = vec4(material.diffuse , material.alpha);
      // gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
      // gl_FragColor = vec4(material.diffuse, 0.0);
      // gl_FragColor = texture2D(myImage, materialInput.st);
  }`;
  const fragmentShaderTextBefore = `
  // uniform vec3 u_color;
  uniform sampler2D myImage;

  varying vec3 v_positionEC;
  varying vec3 v_normalEC;
  varying vec2 v_st;

  void main(){
      vec3 positionToEyeEC = -v_positionEC;

      vec3 normalEC = normalize(v_normalEC);
      #ifdef FACE_FORWARD
          normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
      #endif

      czm_materialInput materialInput;
      materialInput.normalEC = normalEC;
      materialInput.positionToEyeEC = positionToEyeEC;
      materialInput.st = v_st;

      czm_material material = czm_getDefaultMaterial(materialInput);
      material.diffuse = texture2D(myImage, materialInput.st).rgb;
      material.alpha = texture2D(myImage, materialInput.st).a;

      // #ifdef FLAT
          // gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
          // gl_FragColor = vec4(material.diffuse, 0.0);
          gl_FragColor = texture2D(myImage, materialInput.st);
      // #else
      //     gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
      // #endif

      // material.diffuse = texture2D(myImage, materialInput.st).rgb;
      // material.diffuse = texture2D(myImage, fract(materialInput.st)).rgb;// * color.rgb;
      // material.alpha = texture2D(myImage, fract(materialInput.st)).a;// * color.a;
      // material.diffuse.x = 1.0 - material.diffuse.x;
      // material.diffuse.y = 1.0 - material.diffuse.y;
      // material.diffuse.z = 1.0 - material.diffuse.z;

      // gl_FragColor = vec4(color, 0.1);
      // gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
      // gl_FragColor = vec4(material.diffuse + material.emission, 0.1);

  }`;

  let that = this;
  // 1.5 定义纹理
  var texture = undefined;

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

  /* ----- See Here ↓ ------ */
  class StaticTrianglePrimitive {
      /**
       * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
       */
      constructor(option = {}) {
          this._modelMatrix = option.modelMatrix;
          // this.createCommand = null
          this.preExecute = option.preExecute;
          this.positionArray = option.positionArray;
          // this.normalsArray = option.normalsArray;
          this.stArray = option.stArray;
      }

      createVertexBufferByData(frameState) {
          const positionBuffer = Cesium.Buffer.createVertexBuffer({
              usage: Cesium.BufferUsage.STATIC_DRAW,
              typedArray: new Float32Array(this.positionArray),
              context: frameState.context,
          });

          // 2 定义法向数组  n-normal  n-negative/p-positive  x/y/z
          // var npx = [1, 0, 0];
          // var nnx = [-1, 0, 0];
          // var npy = [0, 1, 0];
          // var nny = [0, -1, 0];
          // var npz = [0, 0, 1];
          // var nnz = [0, 0, -1];
          // const normalBuffer = Cesium.Buffer.createVertexBuffer({
          //     context: frameState.context,
          //     // sizeInBytes: 12,
          //     usage: Cesium.BufferUsage.STATIC_DRAW,
          //     typedArray: new Float32Array([
          //         ...npz, ...npz, ...npz,
          //         ...nnz, ...nnz, ...nnz,
          //         ...npz, ...npz, ...npz,
          //         ...nnz, ...nnz, ...nnz,
          //     ]),
          // })

          // 在这里创建纹理坐标Buffer:
          const stBuffer = Cesium.Buffer.createVertexBuffer({
              usage: Cesium.BufferUsage.STATIC_DRAW,
              typedArray: new Float32Array(this.stArray),
              context: frameState.context,
          });

          // 在这里创建 normal Buffer:
          // const normalBuffer = Cesium.Buffer.createVertexBuffer({
          //     usage: Cesium.BufferUsage.STATIC_DRAW,
          //     typedArray: new Float32Array(this.normalsArray),
          //     context: frameState.context,
          // });

          const vertexArray = new Cesium.VertexArray({
              context: frameState.context,
              attributes: [
                  {
                      index: 0, // 等于 attributeLocations['position']
                      vertexBuffer: positionBuffer,
                      componentsPerAttribute: 3,
                      componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  },
                  {
                      index: 1, // 等于 attributeLocations['position']
                      vertexBuffer: stBuffer,
                      componentsPerAttribute: 2,
                      componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  },
                  // {
                  //     index: 2,
                  //     vertexBuffer: normalBuffer,
                  //     componentsPerAttribute: 3,
                  //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                  // }
              ],
          });
          return vertexArray;
      }
      createVertexBufferByDataNext(frameState) {
          console.log("this.positionArray", this.positionArray);
          console.log("this.stArray", this.stArray);
          console.log("this.indicesArray", this.indicesArray);
          var geometry = new Cesium.Geometry({
              attributes: {
                  position: new Cesium.GeometryAttribute({
                      // vtxf 使用double类型的position进行计算
                      // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
                      componentDatatype: Cesium.ComponentDatatype.FLOAT,
                      componentsPerAttribute: 3,
                      values: this.positionArray
                  }),
                  // normal: new Cesium.GeometryAttribute({
                  //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                  //     componentsPerAttribute: 3,
                  //     values: normals
                  // }),
                  textureCoordinates: new Cesium.GeometryAttribute({
                      componentDatatype: Cesium.ComponentDatatype.FLOAT,
                      componentsPerAttribute: 2,
                      values: this.stArray
                  })
              },
              // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
              indices: this.indicesArray,
              primitiveType: Cesium.PrimitiveType.TRIANGLES,
              // boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
          });

          const attributeLocations = {
              position: 0,
              // st: 1,
              // position: 0,
              // normal: 1,
              textureCoordinates: 1,
          };

          var vertexArray = Cesium.VertexArray.fromGeometry({
              context: frameState.context,
              geometry: geometry,
              attributeLocations: attributeLocations,
              bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
              // interleave : true
          });

          return vertexArray;
      }

      createCommand(frameState, matrix) {
          const attributeLocations = {
              position: 0,
              st: 1,
              // normal: 2,
              // textureCoordinates: 1,
          };
          const uniformMap = {
              u_color() {
                  // return Cesium.Color.HONEYDEW
                  // return Cesium.Color.RED;
                  return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
              },
              u_repeat() {
                  return new Cesium.Cartesian2(1.0, 1.0);
              },
              myImage: function() {
                      if (Cesium.defined(texture)) {
                          return texture;
                      } else {
                          return frameState.context.defaultTexture;
                      }
              }
          };

          const vertexArray = this.createVertexBufferByData(frameState);

          const program = Cesium.ShaderProgram.fromCache({
              context: frameState.context,
              vertexShaderSource: vertexShaderText,
              fragmentShaderSource: fragmentShaderText,
              attributeLocations: attributeLocations,
          });
          const renderState = Cesium.RenderState.fromCache({
              depthTest: {
                  enabled: true,
              },
              // blending : {
              //     enabled : true,
              //     color : {
              //         red : 1.0,
              //         green : 1.0,
              //         blue : 1.0,
              //         alpha : 1.0
              //     },
              //     equationRgb : Cesium.BlendEquation.ADD,
              //     equationAlpha : Cesium.BlendEquation.SUBTRACT,
              //     functionSourceRgb : Cesium.BlendFunction.ONE,
              //     functionSourceAlpha : Cesium.BlendFunction.ONE,
              //     functionDestinationRgb : Cesium.BlendFunction.ONE,
              //     functionDestinationAlpha : Cesium.BlendFunction.ONE
              // },
          });
          return new Cesium.DrawCommand({
              // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
              modelMatrix: matrix,
              vertexArray: vertexArray,
              shaderProgram: program,
              uniformMap: uniformMap,
              renderState: renderState,
              pass: Cesium.Pass.TRANSLUCENT,
              // pass: Cesium.Pass.OPAQUE,
          });
      }

      /**
       * @param {FrameState} frameState
       */
      update(frameState) {
          if (this.preExecute) {
              this.preExecute();
          }

          // console.log("stArray", stArray);
          // console.log("this.stArray", this.stArray);

          const command = this.createCommand(
              frameState,
              this._modelMatrix
          );
          frameState.commandList.push(command);
      }
  }

  // try!
  // const viewer = new Cesium.Viewer('cesiumContainer', {
  //   contextOptions: {
  //     requestWebgl2: true
  //   }
  // })
  viewer.scene.globe.depthTestAgainstTerrain = true;
  let primitive = viewer.scene.primitives.add(
      new StaticTrianglePrimitive({
          modelMatrix: modelMatrix,
          positionArray: typedArray,
          stArray: stArray,
          // normalsArray:normalsArray,
      })
  );
  return primitive;
}

export default drawStaticTriangles