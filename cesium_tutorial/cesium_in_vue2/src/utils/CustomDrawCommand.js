/**
 *
 * demo:
 * let primitive = viewer.scene.primitive.add(
 *    new CustomDrawCommand(viewer,{
 *      modelMatrix:modelMatrix,      //must
 *      positionArray:positionArray   //must
 *      vs:vs,                        //must
 *      fs:fs,                        //must
 *      indexArray:indexArray,
 *      normalArray:normalArray,
 *      stArray:stArray,
 *      image:image,
 *      preExecute:preExecute,
 *    })
 * )
 * */
class CustomDrawCommand {

  constructor(viewer, options={}){
    this.viewer = viewer;// depends on where u want to add this to the scene
    this.modelMatrix = option.modelMatrix;//must
    this.pointArr = options.positionArray;//must

    this.staArr = options.stArray;//optional
    this.normalArr = options.normalArray;//optional

    this.indexArr = options.indexArray;//optional

    this.vertexShaderText = options.vs;//must
    this.fragmentShaderText = options.fs;//must

    this.preExecute = options.preExecute;//

    this.u_color = Cesium.Color.RED;
    this.u_alpha = 0.6;
    this.image = options.image;
    this.texture = null;

    this.show = true;

    this.init();
  }

  init() {
    if (!this.vertexShaderText) {
      this.vertexShaderText = `
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 st;
        attribute float batchId;

        // uniform mat modelM;

        varying vec2 v_st;

        void main(){
          vec4 p = vec4(position, 1.0);

          v_st = st;

          gl_Position = czm_projection * czm_view * czm_model * p;
        }
      `;
    }
    if (!this.fragmentShaderText) {
      this.fragmentShaderText = `
        uniform vec4 u_color;
        uniform float u_alpha;
        uniform float u_time;
        uniform sampler2D image;

        varying vec2 v_st;

        void main(){
          czm_materialInput materialInput;
          materialInput.st = v_st;

          czm_material material = czm_getDefaultMaterial(materialInput);
          vec2 st = materialInput.st * 10.0;
          vec4 colorImage = texture2D(image,st);

          material.alpha = colorImage.a * u_alpha;
          material.diffuse = colorImage.rgb * u_color.rgb;

          gl_FragColor = vec4(material.diffuse, material.alpha);
        }
      `;
    }

    this.aboutTexture();
  }

  aboutTexture() {
    if (!this.image) return;
    let that = this;
    Cesium.Resource.createIfNeed(this.image).fetchImage().then(function (image) {
      var vtxfTexture;
      var context = that.viewer.scene.context;
      if (Cesium.define(image.internalFormat)) {
        vtxfTexture = new Cesium.Texture({
          context: context,
          pixelFormat: image.internalFormat,
          width: image.width,
          height: image.height,
          source: {
            arrayBufferView: image.bufferView
          }
        })
      } else {
        vtxfTexture = new Cesium.Texture({
          context: context,
          source: image
        })
      }
      that.texture = vtxfTexture;
    })
  }

  createVBO(frameState) {// VBO - vertices Buffer Object
    // create vertices buffer
    const verticesBuffer = Cesium.Buffer.createVertexBuffer({
      usage: Cesium.BufferUsage.STATIC_DRAW,
      typedArray: new Float32Array(this.pointArr),
      context:frameState.context,
    })

    // create uv buffer
    const uvBuffer = Cesium.Buffer.createVertexBuffer({
      usage: Cesium.BufferUsage.STATIC_DRAW,
      typedArray: new Float32Array(this.staArr),
      context:frameState.context,
    })

    // create normal buffer
    const normalBuffer = Cesium.Buffer.createVertexBuffer({
      usage: Cesium.BufferUsage.STATIC_DRAW,
      typedArray: new Float32Array(this.normalArr),
      context:frameState.context,
    })

    // create index buffer
    let indexBuffer = null;
    if ( this.pointArr.length >= Cesium.Math.SIXTY_FOUR_KILOBYTES && frameState.context.elementIndexUnit) {
      indexBuffer = Cesium.Buffer.createIndexBuffer({
        usage: Cesium.BufferUsage.STATIC_DRAW,
        typedArray: new Unit32Array(this.indexArr),
        context: frameState.context,
        indexDataType: Cesium.IndexDataType.UNSIGNED_INT,
      })
    } else {
      indexBuffer = Cesium.Buffer.createIndexBuffer({
        usage: Cesium.BufferUsage.STATIC_DRAW,
        typedArray: new Unit16Array(this.indexArr),
        context: frameState.context,
        indexDataType: Cesium.IndexDataType.UNSIGNED_SHORT,
      })
    }

    let vboAttributes = [
      {
        index: 0, // 映射/mapping attributeLocation['position']
        vertexBuffer: verticesBuffer,
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        // 下面这三个是可以进行设置的
        // normalize:attribute.normalize,
        // offsetInBytes:offsetInBytes[name],
        // strideInBytes: strideInBytes,
      },
      {
        index: 1,
        vertexBuffer: uvBuffer,
        componentsPerAttribute: 2,
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
      },
      {
        index: 2,
        vertexBuffer: normalBuffer,
        componentsPerAttribute: 2,
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
      },
    ]

    const vertexArray = new Cesium.VertexArray({
      context: frameState.context,
      attributes: vboAttributes,
      indexBuffer: indexBuffer,
    })

    return vertexArray;

  }

  createCommand(frameState) {
    const attributeLocation = {
      position: 0,
      st: 1,
      normal: 2,
    };//compares to add attributes into webGL

    // define uniform u want to use in this object
    const uniformMap = {
      u_color() {
        return this.u_color;
      },
      u_alpha() {
        return this.u_alpha;
      },
      u_time() {
        this.u_time += 0.01;
        if (this.u_time > 1.0) {
          this.u_time = 0.01;//初始值/init
        }
        return this.u_time;
      },
      image() {
        if (Cesium.define(texture)) {// ===  ‘if (texture) ’
          return this.texture;
        } else {
          return frameState.context.defaultTexture;
        }
      },
    };

    const VBO = this.createVBO(frameState);

    const program = Cesium.ShaderProgram.fromCache({
      context: frameState.context,
      vertexShaderSource: this.vertexShaderText,
      fragmentShaderSource: this.fragmentShaderText,
      attributeLocations: attributeLocation,
    })

    const renderState = Cesium.RenderState.fromCache({
      depthTest: {
        enable:true,
      },
      // ...
    })

    return new Cesium.DrawCommand({
      // primitiveType:Cesium.PrimitiveType.TRIANGLE,//类比 webGL drawArray里面的方法
      modelMatrix: this.modelMatrix,//这里是否能获取this？？？
      vertexArray: VBO,
      ShaderProgram: program,
      uniformMap: uniformMap,
      renderState: renderState,
      pass: Cesium.Pass.TRANSLUCENT,//默认不是透明的，只有设置了这一步才能使得 透明度 生效
    })


  }

  update(frameState) {
    if (this.show) {
      if (this.preExecute) {
        this.preExecute();
      }

      const command = this.createCommand(frameState);
      frameState.commandList.push(command);
    }
  }
}

export default CustomDrawCommand;