import * as Cesium from 'cesium'
import CartesianRaduis2Degree from "../CartesianRaduis2Degree.js"
import showAxis from "../showAxis.js";
import translatePointAlongAxis from "../translatePointAlongAxis.js"
/*
    说明： 当前 label 对应的每一个 polyline 都是通过 Entity 实现的。
    原因： 在实现拖拽时，被拖拽的线的首尾两点会发生变化，单纯的算矩阵的话，改变不了，同时有不能设置position。
*/
function StaticLine(
    viewer,
    posA = new Cesium.Cartesian3.fromDegrees(115.20, 38.56, 4000),
    posB = new Cesium.Cartesian3.fromDegrees(116.20, 39.56, 4000),
    width = 10000
) {
    if (!viewer) { alert('必须传入 viewer'); return; }
    // if (!posA) { alert('必须在第二个参数重传入 position, 含义是 position of model'); return; }

    //   效果： 不停的运动
    //  初步思路：
    //  1. 确定关于开始 draw 的判断条件
    //  2. draw 的方式
    //   2.1 确定 2 个点
    //   2.2 将两个点 在相同的方向上 分别平移相同距离，得到 4 个点
    //   2.3 将这4个点，画2个 Triangle
    //   2.4 添加 materials，对比 C端，要会动（关于动的方向，在实现之后看看可以不可以调整） ---- 区别是 不需要纹理进行变化


    let { A_pos,A_neg,B_pos,B_neg } = translateAlongSpecificDirection(posA, posB, width/2,viewer);
    // createPoint(viewer, posA_pos)
    // createPoint(viewer, posA_neg)
    // createPolyline(viewer, [posA_pos, posA_neg]);
    // createPoint(viewer, posB_pos)
    // createPoint(viewer, posB_neg)
    // createPolyline(viewer, [posB_pos, posB_neg]);

    // 画三角形
    // 用 DrawCommand
    // 计算顶点
    let posArr = [];

    // 1-2-3-3-4-1
    posArr.push(A_pos.x)
    posArr.push(A_pos.y)
    posArr.push(A_pos.z)

    posArr.push(A_neg.x)
    posArr.push(A_neg.y)
    posArr.push(A_neg.z)

    posArr.push(B_neg.x)
    posArr.push(B_neg.y)
    posArr.push(B_neg.z)

    posArr.push(B_neg.x)
    posArr.push(B_neg.y)
    posArr.push(B_neg.z)

    posArr.push(B_pos.x)
    posArr.push(B_pos.y)
    posArr.push(B_pos.z)

    posArr.push(A_pos.x)
    posArr.push(A_pos.y)
    posArr.push(A_pos.z)

    // 计算纹理坐标 --- （以时间为基准）---这条线只需要一组纹理坐标即可
    // 1-2-3-3-4-1
    let stArr = [
        0, 0,
        1, 0,
        1, 1,
        1, 1,
        0, 1,
        0, 0
    ];

    // 确定纹理图片
    let imageUri = './imgs/fromShang/Dirlinetexture00.png';

    let primitive = drawStaticLine({
        viewer: viewer,
        imageUri:imageUri,
        typedArray:posArr,
        stArray:stArr,
        // normalsArray,
        // time:0
    });

    viewer.camera.flyTo({
        destination: posA,
    });

    return primitive;
}

function drawStaticLine(option) {
    /*  option:{
            viewer,
            typedArray,
            stArray,
            normalsArray,
            time
        }
    */
    let viewer = option.viewer;
    let imageUri = option.imageUri;

    // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
    // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
    const modelMatrix = Cesium.Matrix4.IDENTITY;

    const vertexShaderText = `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 st;
    attribute float batchId;

    // varying vec3 v_positionEC;
    // varying vec3 v_normalEC;
    varying vec2 v_st;

    void main() {
        vec4 p = vec4(position,1.0);

        // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
        // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
        // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
        v_st = st;

        // v_normal = czm_normal;// * normal;
        // v_normalEC = normal;
        // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

        // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
        gl_Position = czm_projection * czm_view * czm_model * p;
        // gl_Position = czm_modelViewProjectionRelativeToEye * p;
    }`;

    const fragmentShaderText = `
    uniform vec4 u_color;
    uniform float u_alpha;
    uniform sampler2D image;

    varying vec3 v_positionEC;
    varying vec2 v_st;

    void main(){
        czm_materialInput materialInput;
        // materialInput.positionToEyeEC = v_positionEC;
        materialInput.st = v_st;

        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;//*10.0;
        // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
        vec4 colorImage = texture2D(image, vec2(st.s, st.t));
        material.alpha = colorImage.a * u_alpha;
        material.diffuse = colorImage.rgb * u_color.rgb;

        gl_FragColor = vec4(material.diffuse , material.alpha);
    }`;

    // 1.5 定义纹理
    var texture = undefined;
    let u_color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
    let u_alpha = 1.0;

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
    class StaticLinePrimitive {
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
                    // return Cesium.Color.RED;
                    // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    return u_color;
                },
                u_alpha() {
                    return u_alpha;
                },
                // u_time() {
                //     u_time += 0.001;
                //     if (u_time > 1.0) {
                //         u_time = 0.0;
                //     }
                //     return u_time;
                // },
                image: function() {
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

            const command = this.createCommand(
                frameState,
                this._modelMatrix
            );

            frameState.commandList.push(command);
        }
    }

    viewer.scene.globe.depthTestAgainstTerrain = true;
    let primitive = viewer.scene.primitives.add(
        new StaticLinePrimitive({
            modelMatrix: modelMatrix,
            positionArray: option.typedArray,
            stArray: option.stArray,
            // time: option.time,
            // normalsArray:normalsArray,
        })
    );



    return primitive;
}

drawStaticLine.prototype.update = function (posA,posB) {

}

// for test
function createPoint(viewer, pos, color=Cesium.Color.YELLOW,size=10){
    let point = viewer.entities.add({
        position: pos,
        point: {
            pixelSize: size,
            color: color,
        },
    });
    return point;
}

function createPolyline(viewer, pos=Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]), color=Cesium.Color.YELLOW,width=5){
    const polyline = viewer.entities.add({
        polyline: {
            positions: pos,
            width: width,
            arcType: Cesium.ArcType.RHUMB,
            material: color,
        },
    });
    return polyline;
}


function translateAlongSpecificDirection(posA, posB, distance = 500) {
    let MatrixA = Cesium.Transforms.eastNorthUpToFixedFrame(posA);
    let MatrixB = Cesium.Transforms.eastNorthUpToFixedFrame(posB);

    // 绕 Z 轴旋转 一定角度后的到的点
    // 这个角度：利用 direction 在 XY 的投影与 X 轴的夹角 进行计算
    // let direction = Cesium.Cartesian3.subtract(posB, posA, new Cesium.Cartesian3());//  vector AB
    let direction = Cesium.Cartesian3.subtract(posA, posB, new Cesium.Cartesian3());//  vector AB
    let directionMagnitude = Cesium.Cartesian3.magnitude(direction);//  vector AB

    // ‼谨记：所有的变换都要在 世界坐标系中做完，然后通过 矩阵变换到 ENU 里面去。不然真的很不方便
    // 当前步骤最终的目的是： 算出 direction 在 XY（ world ）中的投影向量
    // 1. 找到 direction 在世界坐标系与各个 axis 方向的夹角
    let degreeD2Z = Cesium.Cartesian3.angleBetween(direction, Cesium.Cartesian3.UNIT_Z);
    let degreeD2X = Cesium.Cartesian3.angleBetween(direction, Cesium.Cartesian3.UNIT_X);
    let degreeD2Y = Cesium.Cartesian3.angleBetween(direction, Cesium.Cartesian3.UNIT_Y);

    // 2. 计算 direction 在各个 axis 的分量（ world )
    let disY = directionMagnitude * Math.cos(degreeD2Y * (180 / Math.PI));
    let disX = directionMagnitude * Math.cos(degreeD2X * (180 / Math.PI));

    // 3. 知道 XY 与 X 轴的夹角：  借助 arctan 函数 ， tan = Y/X
    let degreeX2XY = - Math.atan(disY / disX ) * (180 / Math.PI);

    // 4. 根据 得到的degree，获取到的 绕Z轴( world ) 的旋转矩阵， 而后更新 posA，posB 的 矩阵
    let zRotate = Cesium.Matrix4.fromRotation(Cesium.Matrix3.fromRotationZ(degreeX2XY, new Cesium.Matrix3()), new Cesium.Matrix4());
    let A_trans_matrix = Cesium.Matrix4.multiply(MatrixA, zRotate, new Cesium.Matrix4());
    let B_trans_matrix = Cesium.Matrix4.multiply(MatrixB, zRotate, new Cesium.Matrix4());


    let normalizedDirection = Cesium.Cartesian3.normalize(Cesium.Cartesian3.cross(posA, posB, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    let normalizedDirection_Neg = Cesium.Cartesian3.negate(normalizedDirection, new Cesium.Cartesian3())

    let normal = Cesium.Cartesian3.multiplyByScalar(normalizedDirection, distance, new Cesium.Cartesian3())
    normal.z = 0;
    let normal_Neg = Cesium.Cartesian3.multiplyByScalar(normalizedDirection_Neg, distance, new Cesium.Cartesian3())
    normal_Neg.z = 0;

    // A
    let A_pos = Cesium.Matrix4.multiplyByPoint(A_trans_matrix, normal, new Cesium.Cartesian3())
    let A_neg = Cesium.Matrix4.multiplyByPoint(A_trans_matrix, normal_Neg, new Cesium.Cartesian3())
    // B
    let B_pos = Cesium.Matrix4.multiplyByPoint(B_trans_matrix, normal, new Cesium.Cartesian3())
    let B_neg = Cesium.Matrix4.multiplyByPoint(B_trans_matrix, normal_Neg, new Cesium.Cartesian3())

    return{A_pos,A_neg,B_pos,B_neg}

}

export default StaticLine