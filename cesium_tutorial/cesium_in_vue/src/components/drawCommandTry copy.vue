<template>
    <div id="cesiumContainer"></div>
</template>

<script>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import antiAliasing from "../utils/antiAliasing.js";
import showAxis from "../utils/showAxis.js";
import translatePointAlongAxis from "../utils/translatePointAlongAxis.js";
import DynamicLine from "../utils/primitive/DynamicLine.js";
import StaticLine from "../utils/primitive/StaticLine.js";
import BezierBy4Point from "../utils/BezierBy4Point.js";
import BezierBy3Point from "../utils/BezierBy3Point.js";
import ForTest from "../utils/ForTest.js";
import FZRadar from "../utils/primitive/FZRadar.js";

// methods
import drawTriangle from "../utils/methodsForTest/drawCommandTry/drawTriangle.js";
import drawLine from "../utils/methodsForTest/drawCommandTry/drawLine.js";
import drawCommandDemoForTail from "../utils/methodsForTest/drawCommandTry/drawCommandDemoForTail.js";

import { getCartesian3sForTailInDemoJS } from '../utils/methodsForTest/drawCommandTry/getCartesian3sForTailInDemoJS.js'
// getCartesian3sForTailInDemoJS()
import { getPointsForTailInDemoJS } from '../utils/methodsForTest/drawCommandTry/getPointsForTailInDemoJS.js'
// getPointsForTailInDemoJS()


export default {
    name: "modelInstanceCollection",
    data() {
        return {
            viewer: null,
            cesiumHandler: null,
            imageUri: null,

            // for test
            cartesian3s:getCartesian3sForTailInDemoJS(),
            points:getPointsForTailInDemoJS(),
        };
    },

    mounted() {
        Cesium.Ion.defaultAccessToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODk1NmMwNC02MjYwLTQyZWUtYTIxMy1lMjgwMTA3NWE1MmIiLCJpZCI6NDI2NzgsImlhdCI6MTYxMTcwOTEzMH0.DwVnaNdLhZd8miWzYmC9O2k2F4_ODdrWU3EFZRbOWLo";

        let viewer = new Cesium.Viewer("cesiumContainer", {
            shouldAnimate: true, //有动画
            animation: false, //动画控制不显示
            timeline: false, //时间线不显示
            // fullscreenButton: false, //全屏按钮不显示
            infoBox: false,
            // selectionIndicator: true,
            contextOptions: {
                requestWebgl2: true,
            },
        });
        this.viewer = viewer;


        let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        this.cesiumHandler = handler;

        antiAliasing(viewer); // 抗锯齿
        // viewer.extend(Cesium.viewerCesiumInspectorMixin); //

        this.ForTest = new ForTest(viewer);

        // 从方针中得到的一段数据

        // 利用 DrawCommand 画两个连在一起的 Triangles
        let pos = new Cesium.Cartesian3.fromElements(-2990189.4940976757, 4982327.975073074, 2620977.340861506)
        // drawTriangle(viewer, pos);// 2 个参数 modelCenter -> Cartesian3
        drawLine(viewer, pos);// 2 个参数 modelCenter -> Cartesian3
        this.viewer.camera.flyTo({
            destination:pos,
        })

        // for Tail
        // drawCommandDemoForTail(viewer);
        // this.drawCommandDemo222ForTail();
        // this.directlyProjectUse();// 此时没有计算 stArray /* 在上一个函数的基础上，计算出每一个点相对于当前的偏移，是否可以？ */
        // this.drawDynamicTrianglesByShader();// 在shader中实现


        // for line --- 飞机与地面站之间的连线：
        // this.lineForTargetAndAirplane()//OK
        // DynamicLine(viewer);//添加会动的纹理
        // StaticLine(viewer);//添加纯色的纹理

        // for Radar
        // let pos = new Cesium.Cartesian3.fromDegrees(116.20, 39.56);
        // FZRadar({
        //     viewer,
        //     position: pos,
        // })
        // this.viewer.camera.flyTo({'destination': Cesium.Cartesian3.fromDegrees(116.20, 39.56,10000)})

        // this.customRadarByDrawCommand();// 这个方法中，同样的 点集，用于画 扇形的时候就OK，但是用于画线就不行了。-->还是先尝试使用 custom Primitive 进行编写吧，webGL精进了再来看看。
        // this.customRadarByCustomPrimitive();//刚拿过来，还没改，不过现在能运行
        // this.customRadarByEllipsoidPrimitive();// 如果使用的话，生成的雷达中间下凹的部分依然是没有一个顺畅的过渡，所以不适用于当前的场景
        // this.testForDrawACircleByBezier4Point();//尝试了，还是没那么圆。。。

        // for have a test for new things
        // this.draw_By_Indices()
    },

    methods: {

        draw_By_Indices() {

            let drawDynamicTriangles = (option)=>{
                /*  option:{
                        typedArray,
                        stArray,
                        normalsArray,
                        time,
                        center,
                    }
                */

                // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
                // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
                const modelMatrix = option.center ? Cesium.Transforms.eastNorthUpToFixedFrame(option.center) : Cesium.Matrix4.IDENTITY;

                const vertexShaderText = `
                attribute vec3 position;
                attribute vec3 normal;
                // attribute vec2 st;
                attribute float batchId;

                // varying vec3 v_positionEC;
                // varying vec3 v_normalEC;
                // varying vec2 v_st;

                void main() {
                    vec4 p = vec4(position,1.0);

                    // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                    // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                    // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                    // v_st = st;


                    gl_Position = czm_projection * czm_view * czm_model * p;
                    // gl_Position = czm_modelViewProjectionRelativeToEye * p;
                }`;
                const fragmentShaderText = `
                uniform vec4 u_color;
                uniform float u_alpha;
                // uniform float u_time;
                // uniform sampler2D image;

                // varying vec3 v_positionEC;
                // varying vec2 v_st;

                void main(){
                    czm_materialInput materialInput;
                    // materialInput.positionToEyeEC = v_positionEC;
                    // materialInput.st = v_st;

                    czm_material material = czm_getDefaultMaterial(materialInput);
                    // vec2 st = materialInput.st*10.0;
                    // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                    // material.alpha = colorImage.a * u_alpha;
                    // material.diffuse = colorImage.rgb * u_color.rgb;
                    material.alpha = u_alpha;
                    material.diffuse = u_color.rgb;

                    gl_FragColor = vec4(material.diffuse , material.alpha);
                }`;

                let that = this;
                // 1.5 定义纹理
                var texture = undefined;
                let u_color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                let u_alpha = 1.0;
                let u_time = 0.5;

                var imageUri = this.imageUri;
                Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                    console.log('image loaded!');
                    var vtxfTexture;
                    var context = that.viewer.scene.context;
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
                class DynamicTrianglePrimitive {
                    /**
                     * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
                     */
                    constructor(option = {}) {
                        this._modelMatrix = option.modelMatrix;
                        // this.createCommand = null
                        this.preExecute = option.preExecute;
                        this.positionArray = option.positionArray;
                        // this.normalsArray = option.normalsArray;
                        // this.stArray = option.stArray;
                        this.indicesArray = option.indicesArray;
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
                    createVertexBufferByDataUseIndices2(frameState) {// not OK
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
                        // const stBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Float32Array(this.stArray),
                        //     context: frameState.context,
                        // });

                        // 在这里创建 normal Buffer:
                        // const normalBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Float32Array(this.normalsArray),
                        //     context: frameState.context,
                        // });

                        // const indexBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Uint16Array(this.indicesArray),
                        //     context: frameState.context,
                        // });
                        let indexBuffer = null;
                        if ( this.positionArray.length >= Cesium.Math.SIXTY_FOUR_KILOBYTES && frameState.context.elementIndexUint ) {
                            indexBuffer = Cesium.Buffer.createIndexBuffer({
                                context: frameState.context,
                                typedArray: new Uint32Array(this.indicesArray),
                                usage: Cesium.BufferUsage.STATIC_DRAW,
                                indexDatatype: Cesium.IndexDatatype.UNSIGNED_INT,
                            });
                        } else {
                            indexBuffer = Cesium.Buffer.createIndexBuffer({
                                context: frameState.context,
                                typedArray: new Uint16Array(this.indicesArray),
                                usage: Cesium.BufferUsage.STATIC_DRAW,
                                indexDatatype: Cesium.IndexDatatype.UNSIGNED_SHORT,
                            });
                        }

                        const vertexArray = new Cesium.VertexArray({
                            context: frameState.context,
                            attributes: [
                                {
                                    index: 0, // 等于 attributeLocations['position']
                                    vertexBuffer: positionBuffer,
                                    componentsPerAttribute: 3,
                                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                },
                                // {
                                //     index: 1, // 等于 attributeLocations['position']
                                //     vertexBuffer: stBuffer,
                                //     componentsPerAttribute: 2,
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                // },
                                // {
                                //     index: 2,
                                //     vertexBuffer: normalBuffer,
                                //     componentsPerAttribute: 3,
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                                // }
                            ],
                            indexBuffer: indexBuffer,
                        });
                        return vertexArray;
                    }
                    createVertexBufferByDataUseIndices(frameState) {//OK --- conclude: if want to use indices, need stArray too.Cause the API Cesium s holding.
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
                                // textureCoordinates: new Cesium.GeometryAttribute({
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                //     componentsPerAttribute: 2,
                                //     values: this.stArray
                                // })
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
                            // textureCoordinates: 1,
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
                            // st: 1,
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
                            u_time() {
                                u_time += 0.001;
                                if (u_time > 1.0) {
                                    u_time = 0.0;
                                }
                                return u_time;
                            },
                            image: function() {
                                if (Cesium.defined(texture)) {
                                    return texture;
                                } else {
                                    return frameState.context.defaultTexture;
                                }
                            }
                        };

                        let vertexArray = null;
                        // if (this.indicesArray) {
                            // vertexArray = this.createVertexBufferByDataUseIndices(frameState);
                            vertexArray = this.createVertexBufferByDataUseIndices2(frameState);
                        // } else {
                            // vertexArray = this.createVertexBufferByData(frameState);
                        // }

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

                this.viewer.scene.globe.depthTestAgainstTerrain = true;
                let primitive = this.viewer.scene.primitives.add(
                    new DynamicTrianglePrimitive({
                        modelMatrix: modelMatrix,
                        positionArray: option.typedArray,
                        // stArray: option.stArray,
                        indicesArray:option.indicesArray,
                        // time: option.time,
                        // normalsArray:normalsArray,
                    })
                );

                return primitive;
            };

            let posA = new Cesium.Cartesian3.fromElements(this.cartesian3s[0].x, this.cartesian3s[0].y, this.cartesian3s[0].z);
            let posB = new Cesium.Cartesian3.fromDegrees(116.20, 39.56, 600000);

            let width = 10000;
            let A = translatePointAlongAxis(posA, { x: width/2, y: 0, z: 0, });
            let A_neg = translatePointAlongAxis(posA, { x: -width/2, y: 0, z: 0, });
            // this.createPoint(A, Cesium.Color.YELLOW);
            // this.createPoint(A_neg, Cesium.Color.RED);
            let B = translatePointAlongAxis(posB, { x: width/2, y: 0, z: 0, });
            let B_neg = translatePointAlongAxis(posB, { x: -width/2, y: 0, z: 0, });
            // this.createPoint(B, Cesium.Color.RED);
            // this.createPoint(B_neg, Cesium.Color.RED);

            // 画三角形
            // 用 DrawCommand
            // 计算顶点
            let posArr = [];

            // 1-2-3-4
            posArr.push(A.x)
            posArr.push(A.y)
            posArr.push(A.z)

            posArr.push(A_neg.x)
            posArr.push(A_neg.y)
            posArr.push(A_neg.z)

            posArr.push(B_neg.x)
            posArr.push(B_neg.y)
            posArr.push(B_neg.z)

            // posArr.push(B_neg.x)
            // posArr.push(B_neg.y)
            // posArr.push(B_neg.z)

            posArr.push(B.x)
            posArr.push(B.y)
            posArr.push(B.z)

            // posArr.push(A.x)
            // posArr.push(A.y)
            // posArr.push(A.z)

            // 计算纹理坐标 --- （以时间为基准）---这条线只需要一组纹理坐标即可
            // 1-2-3-4
            let stArr = [
                0, 0,
                1, 0,
                1, 1,
                0, 1,
            ];

            // 整理 indices
            let indicesArray = [
                0, 1, 2,
                1, 3, 2,
            ]

            // 确定纹理图片
            this.imageUri = './imgs/fromLW/rectangle-T_trans.png';
            // this.imageUri = './imgs/fromLW/rectangle-S_trans.png';

            // this.drawStaticTriangles(posArr, stArr);
            // drawDynamicTriangles({
            //     typedArray:posArr,
            //     // stArray: stArr,
            //     indicesArray: indicesArray
            //     // normalsArray,
            //     // time:0
            // });
            // this.viewer.camera.flyTo({
            //     destination: new Cesium.Cartesian3.fromElements(posA.x,posA.y,posA.z+1000000),
            // });

            let posArr2 = [];
            posArr2.push(...[0.0,0.0,0.0])
            posArr2.push(...[0.5,0.0,0.0])
            posArr2.push(...[0.5,0.5,0.0])
            posArr2.push(...[0.0, 0.5, 0.0])
            posArr2 = posArr2.map(item => {
                return item * 1000
            })
            let indicesArray2 = [
                0, 1, 2,
                2, 3, 0
            ];
            drawDynamicTriangles({
                center:Cesium.Cartesian3.fromDegrees(112, 23, 100000),
                typedArray:posArr2,
                // stArray: stArr,
                indicesArray: indicesArray2
                // normalsArray,
                // time:0
            });

            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(112, 23, 100000),
            });
        },

        //for tail
        drawCommandDemoForTail_() {
            let cartesian3s = this.cartesian3s;
            let points = this.points;

            for (let i = 0; i < cartesian3s.length; i++) {
                let pos = Cesium.Cartesian3.fromElements(
                    cartesian3s[i].x,
                    cartesian3s[i].y,
                    cartesian3s[i].z
                );
                this.createPoint(pos);
            }
            // for (let i = 0; i < points.length; i++) {
            //     let centerPos = Cesium.Cartesian3.fromElements(
            //         points[i].x,
            //         points[i].y,
            //         points[i].z
            //     );
            //     this.createPoint(centerPos);
            // }

            let midPoint = Cesium.Cartesian3.fromElements(points[0].x, points[0].y, points[0].z);
            let point = this.createPoint(midPoint,Cesium.Color.RED);
            let M = point.computeModelMatrix(Cesium.JulianDate.now());
            showAxis(
                { modelMatrix: M },
                this.viewer.scene,
                6000000
            );

            // let sumDistance = this.getSumDistanceByCartesianDistance(cartesian3s);

            // 获取 position 点集
            let arr = [];
            let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
            for (let i = 0; i < len;i++) {
                arr.push(cartesian3s[i].x);
                arr.push(cartesian3s[i].y);
                arr.push(cartesian3s[i].z);
            }

            // 获取 st 纹理坐标
            let stArr = [];
            let stLen = len / 6 + 1;// 得到的是 所画的 平面的数量 ---》 现在当前整个轨迹上单个方向上所包含的点的数量

            // let curSumPoints = stLen;

            // let pos = 6;// 1~6 // 6就是没颜色
            let imgHeight = 200;
            let pos = 0;//
            let touPos = 100;//
            let weiPos = 100;//
            // let sub = 1 / 100;//20 个点变一个颜色
            // let sub = imgHeight / stLen;//20 个点变一个颜色
            // let sub = stLen/imgHeight;// 这个数值的意思是 每个单位 平面会切换颜色 ---》 //! 想要的是 每一组的4个点内就会存在颜色渐变，这样才会更好。
            let sub = imgHeight/stLen;// 这个数值的意思是 st 被当前的 点平均后每一份的长度 ---
            // let transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
            let transparent_pos = null;

            // let k = (stLen + 1) / imgHeight;// 把 st 中的每一个 pixel 分成几份
            for (let i = 0; i < stLen; i++) {//
                // 每个平面需要4 个点，然后组成两个三角形。 找到 当前的 4个点
                /*
                    0,0
                    1,0
                    0,i/stLen
                    1,i/stLen
                */

                // i 代表的是 draw 的某一个 平面，即2个三角形。
                // 那如何定义 st 坐标呢？---》
                //   整个 贴图 可以被分成是多少个平面，----》如何确定这个事情？ ：
                //       --- 应该是想要被分成多少个平面-- -》 由什么决定呢？ ：
                // let a = [0, (i/stLen) / imgHeight];
                // let b = [1, (i/stLen) / imgHeight];
                // let c = [1, ((i+1)/stLen) / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
                // let d = [0, ((i+1)/stLen)/ imgHeight];

                let a = [0, pos / imgHeight];
                let b = [1, pos / imgHeight];
                let c = [1, (pos + sub) / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
                let d = [0, (pos + sub) / imgHeight];
                console.log("pos+ sub / imgHeight", (pos + sub)/ imgHeight);


                transparent_pos = [ ...a, ...b, ...c, ...c, ...d, ...a, ];
                // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
                // transparent_pos = [
                //     0, pos / imgHeight,
                //     1, pos / imgHeight,
                //     1, pos / imgHeight,
                //     1, pos / imgHeight,
                //     0, pos / imgHeight,
                //     0, pos / imgHeight
                // ];

                stArr.push(...transparent_pos)

                pos += sub;
            }
            // for (let i = 0; i < stLen; i++) {//
            //     /*
            //         首尾是需要透明的 ---》 那就规定多少点显示透明的texture，即首尾的点的数量。其他的都显示纯白色。
            //         注意：选择的点数需要将颜色从无过渡到纯白//是否不必那么严苛？

            //         那么：首尾各选多少点呢？---》 只需要考虑尾部就可以了，现在是 tail。---》 暂定 120 个
            //         我在想要不要动态的变化？暂时还是先不要了，那样的话数学计算还是挺多。。。。
            //     */

            //     // 每个平面需要4 个点，然后组成两个三角形。 找到 当前的 4个点
            //     /*
            //         0,0
            //         1,0
            //         0,i/stLen
            //         1,i/stLen
            //     */

            //     // i 代表的是 draw 的某一个 平面，即2个三角形。
            //     // 那如何定义 st 坐标呢？---》
            //     //   整个 贴图 可以被分成是多少个平面，----》如何确定这个事情？ ：
            //     //       --- 应该是想要被分成多少个平面-- -》 由什么决定呢？ ：
            //     let a = [0, k / imgHeight];
            //     let b = [1, k / imgHeight];
            //     let c = [1, 2k / imgHeight];// pos+1 这里不可以 +1，这样的颜色变化太明显
            //     let d = [0, 2k/ imgHeight];

            //     // if (i != 0) { pos += sub };
            //     // pos += sub;

            //     // if (i != 0) {
            //     //     // 单侧透明
            //     //     // if (pos < 100) {
            //     //     //     // pos += sub
            //     //     //     pos = i + 10;
            //     //     // } else {
            //     //     //     pos = 100;
            //     //     // }
            //     //     // 双侧透明
            //     //     if (i < stLen / 2) {
            //     //         // pos = i;
            //     //         // pos = 0;
            //     //         // pos = 100;
            //     //         pos = touPos--;

            //     //         // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
            //     //     } else if (i - stLen / 2 < 2) {
            //     //         // pos = 100;
            //     //         pos = 0;
            //     //     } else {

            //     //         // pos = 200 - pos;
            //     //         // console.log("(200 - pos)", (200 - pos));
            //     //         // transparent_pos = [0, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 1, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight, 0, (200 - pos) / imgHeight];
            //     //         // pos--;
            //     //         // pos = 0;
            //     //         // pos = 10;
            //     //         pos = weiPos--;
            //     //     }

            //     //     // if (pos > 0) {
            //     //     //     pos--;
            //     //     // }
            //     //     // console.log("pos", pos);
            //     //     transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
            //     //     console.log("pos", pos);
            //     // };
            //     // pos = 20;

            //     // transparent_pos = [0, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 1, pos / imgHeight, 0, pos / imgHeight, 0, pos / imgHeight];
            //     // transparent_pos = [
            //     //     0, pos / imgHeight,
            //     //     1, pos / imgHeight,
            //     //     1, pos / imgHeight,
            //     //     1, pos / imgHeight,
            //     //     0, pos / imgHeight,
            //     //     0, pos / imgHeight
            //     // ];


            //     // let transparent_pos = [
            //     //     0, pos / 200,
            //     //     1, pos / 200,
            //     //     1, pos + sub / 200,
            //     //     1, pos + sub / 200,
            //     //     0, pos + sub / 200,
            //     //     0, pos / 200,
            //     // ];
            //     // let transparent_pos = [
            //     //     pos / 200,0,
            //     //     pos / 200,1,
            //     //     pos + sub / 200,1,
            //     //     pos + sub / 200,1,
            //     //     pos + sub / 200,0,
            //     //     pos / 200,0,
            //     // ];

            //     stArr.push(...transparent_pos)

            // }

            if (0) {// 获取 normals --- 定义法向数组
                // 获取 normals --- 定义法向数组
                var npx = [1, 0, 0];
                var nnx = [-1, 0, 0];
                var npy = [0, 1, 0];
                var nny = [0, -1, 0];
                var npz = [0, 0, 1];
                var nnz = [0, 0, -1];
                let normalsArr = [];
                let normalsArr_n = [];
                let normalsArr_p = [];
                // 使用demo
                // let normals = new Float32Array([
                //     // 下 -z
                //     ...nnz, ...nnz, ...nnz, ...nnz,
                //     // // 前 -y
                //     // ...nny, ...nny, ...nny, ...nny,
                //     // // 后 +y
                //     // ...npy, ...npy, ...npy, ...npy,
                //     // // 左 -x
                //     // ...nnx, ...nnx, ...nnx, ...nnx,
                //     // // 右 +x
                //     // ...npx, ...npx, ...npx, ...npx,
                //     // 上 +z
                //     ...npz, ...npz, ...npz, ...npz,
                // ]);
                // 获取 每个点对应的normals
                // for (let i = 0; i < oriPoints + 1 ;i++) {
                //     /*
                //         计算出当前点的 法向量？？？
                //     */

                //     normalsArr_p.push(...npz);// 上 +z
                //     normalsArr_n.push(...nnz);// 下 -z
                // }

                // normalsArr = [
                //     ...normalsArr_n,
                //     ...normalsArr_p
                // ];
            }

            // this.imageUri = '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
            // this.imageUri = './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
            // this.imageUri = './imgs/fromShang/Dirlinetexture07.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture05.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture04.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture03.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture02.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture01.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture00.png';//128*128
            // this.imageUri = './imgs/fromShang/esrth.svg.png';
            // this.imageUri = './imgs/colors.png';//512*32
            // this.imageUri = './imgs/blue.png';//412*65
            // this.imageUri = './imgs/blackAndWhite.png';//70*18
            // this.imageUri = './imgs/fromLW/rectangle.png';//50*200
            this.imageUri = './imgs/fromLW/diamond.png';//50*200

            let primitive = this.drawStaticTriangles(arr, stArr);// 法向量目前不用

        },
        drawCommandDemo222ForTail (){
            let cartesian3s = this.cartesian3s;
            let points = this.points;
            // 这个也不对，根据某个点得到的平移矩阵平移其他的点时，跑到了很远的地方---》矩阵不对
            let firstPoint = Cesium.Cartesian3.fromElements( cartesian3s[0].x, cartesian3s[0].y, cartesian3s[0].z );
            this.createPoint(firstPoint,Cesium.Color.RED);
            let secondPoint = Cesium.Cartesian3.fromElements( cartesian3s[1].x, cartesian3s[1].y, cartesian3s[1].z );
            this.createPoint(firstPoint,Cesium.Color.GREEN);
            let midPoint = Cesium.Cartesian3.fromElements( points[0].x, points[0].y, points[0].z );
            // const transitionMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(midPoint);

            let point = this.createPoint(midPoint,Cesium.Color.RED);
            let M = point.computeModelMatrix(Cesium.JulianDate.now());
            showAxis(
                { modelMatrix: M },
                this.viewer.scene,
                6000000
            );

            // 获取 position 点集
            let arr = [];
            let len = cartesian3s.length;// 这些数据来的时候就已经被处理好了
            for (let i = 0; i < len;i++) {
                arr.push(cartesian3s[i].x);
                arr.push(cartesian3s[i].y);
                arr.push(cartesian3s[i].z);
            }
            // 获取原来按顺序的点：
            let oriPoints = [];
            for (let i = 0; i < len;) {

                oriPoints.push(cartesian3s[i])
                oriPoints.push(cartesian3s[i+1])
                oriPoints.push(cartesian3s[i+2])

                i += 6;
            }
            console.log("len", len);
            console.log("oriPoints.length", oriPoints.length);

            // 获取 st 纹理坐标
            let stArr = [];
            let stLen = len / 2;
            // let unit_ = 512 / stLen;
            // // let unit_ = 5 / stLen;
            // let unit_ = 32 / stLen;
            // let unit_ = 70 / stLen;
            let unit_ = 128 / stLen;

            let a = [0, 0];
            let b = [1, 0];

            let pos = 6;// 1~6 // 6就是没颜色
            let sub = 1/30;//20 个点变一个颜色
            for (let i = 0; i < stLen; i++) {// stLen == 111
                /*
                    首尾是需要透明的 ---》 那就规定多少点显示透明的texture，即首尾的点的数量。其他的都显示纯白色。
                    注意：选择的点数需要将颜色从无过渡到纯白//是否不必那么严苛？

                    那么：首尾各选多少点呢？---》 只需要考虑尾部就可以了，现在是 tail。---》 暂定 120 个
                    我在想要不要动态的变化？暂时还是先不要了，那样的话数学计算还是挺多。。。。
                */

                // 找到 当前的 4个点
                /*
                    0,0
                    1,0
                    0,i/stLen
                    1,i/stLen
                */

                // 当前 img 是 128*128 的
                // 现在的想法：每20个点一变化
                // let a = [0, pos / 128];
                // let b = [1, pos / 128];
                // let c = [1, pos+1 / 128];
                // let d = [0, pos+1 / 128];
                if (i != 0) { pos -= sub };


                // let transparent_      = [0, 5 / 128, 1, 5 / 128, 1, 6 / 128,  1, 6 / 128, 0, 0, 5 / 128, 6 / 128]
                // let transparent_1     = [0, 4 / 128, 1, 4 / 128, 1, 5 / 128,  1, 5 / 128, 0, 0, 4 / 128, 5 / 128]
                let transparent_pos = [0, pos / 128, 1, pos / 128, 1, pos / 128, 1, pos / 128, 0, pos / 128, 0, pos / 128];
                // let transparent_2 = [0, 2 / 128, 1, 2 / 128, 1, 2 / 128, 1, 2 / 128, 0, 2 / 128, 0, 2 / 128];
                // let transparent_11 = [
                //     0, 3 / 128,
                //     1, 3 / 128,
                //     1, 4 / 128,
                //     1, 4 / 128,
                //     0, 4 / 128,
                //     0, 3 / 128,
                // ]
                // let transparent_111   = [0, 2 / 128, 1, 2 / 128, 1, 3 / 128,  1, 3 / 128, 0, 0, 2 / 128, 3 / 128]
                // let transparent_1111  = [0, 1 / 128, 1, 1 / 128, 1, 2 / 128,  1, 2 / 128, 0, 0, 1 / 128, 2 / 128]
                // let transparent_11111 = [0, 0 / 128, 1, 0 / 128, 1, 1 / 128,  1, 1 / 128, 0, 0, 0 / 128, 1 / 128]
                stArr.push(...transparent_pos)


                // let a = [0, 0];
                // let b = [1, 0];
                // let c = [1, 1];
                // let d = [0, 1];

                // 找到对应的 4 个 位置 -- 1-2-3-3-1-4
                // let curPos = i * unit_;

                // let a = [0, 0];
                // let b = [1, 0];
                // let c = [1, i * unit_];
                // let d = [0, i * unit_];

                // stArr.push(...[ 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);// 两个三角形的贴图的方向不一致，完全垂直
                // stArr.push(...a, ...b, ...c, ...c, ...a, ...d);//OK 1-2-3-3-1-4  for Dirlinetexture01.png / 02
                // stArr.push(...a, ...b, ...c, ...a, ...d, ...c);//OK 1-2-3-1-4-3  for Dirlinetexture04.png
                // stArr.push(...a, ...b, ...c, ...c, ...d, ...a);//OK 1-2-3-3-4-1  for Dirlinetexture03.png
                // stArr.push(...[
                //     0, 0,
                //     1, 0,
                //     1, 1,
                //     0, 0,
                //     1, 1,
                //     0, 1,
                // ]);//OK 1-2-3-3-1-4  for Dirlinetexture02.png
                // for Dirlinetexture05.png

                // a = d;
                // b = c;


                // stArr.push(
                //     ...a,
                //     ...b,
                //     ...c,
                //     ...c,
                //     ...d,
                //     ...a,
                // );//OK
            }

            /*  获取indices  --- 暂时没用上
                let indicesArr = [];
                let index = [0, 1, 2, 3];
                for (let i = 0; i < stLen; i++) {
                    indicesArr.push(index[0])
                    indicesArr.push(index[1])
                    indicesArr.push(index[2])
                    indicesArr.push(index[2])
                    indicesArr.push(index[1])
                    indicesArr.push(index[3])
                    index[0] += 2;
                    index[1] += 2;
                    index[2] += 2;
                    index[3] += 2;
                }
            */

            // 获取 normals --- 定义法向数组
            var npx = [1, 0, 0];
            var nnx = [-1, 0, 0];
            var npy = [0, 1, 0];
            var nny = [0, -1, 0];
            var npz = [0, 0, 1];
            var nnz = [0, 0, -1];
            let normalsArr = [];
            let normalsArr_n = [];
            let normalsArr_p = [];
            // 使用demo
            // let normals = new Float32Array([
            //     // 下 -z
            //     ...nnz, ...nnz, ...nnz, ...nnz,
            //     // // 前 -y
            //     // ...nny, ...nny, ...nny, ...nny,
            //     // // 后 +y
            //     // ...npy, ...npy, ...npy, ...npy,
            //     // // 左 -x
            //     // ...nnx, ...nnx, ...nnx, ...nnx,
            //     // // 右 +x
            //     // ...npx, ...npx, ...npx, ...npx,
            //     // 上 +z
            //     ...npz, ...npz, ...npz, ...npz,
            // ]);
            // 获取 每个点对应的normals
            // for (let i = 0; i < oriPoints + 1 ;i++) {
            //     /*
            //         计算出当前点的 法向量？？？
            //     */

            //     normalsArr_p.push(...npz);// 上 +z
            //     normalsArr_n.push(...nnz);// 下 -z
            // }

            // normalsArr = [
            //     ...normalsArr_n,
            //     ...normalsArr_p
            // ];

            // this.imageUri = '../../SampleData/models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
            // this.imageUri = './models/CesiumBalloon/CesiumBalloonPrint_singleDot.png';
            // this.imageUri = './imgs/fromShang/Dirlinetexture07.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture05.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture04.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture03.png';//128*128
            this.imageUri = './imgs/fromShang/Dirlinetexture02.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture01.png';//128*128
            // this.imageUri = './imgs/fromShang/Dirlinetexture00.png';//128*128
            // this.imageUri = './imgs/fromShang/esrth.svg.png';
            // this.imageUri = './imgs/colors.png';//512*32
            // this.imageUri = './imgs/blue.png';//412*65
            // this.imageUri = './imgs/blackAndWhite.png';//70*18

            let primitive = this.drawStaticTriangles(arr, stArr, normalsArr);// 法向量目前不用

        },
        directlyProjectUse() {
            let cartesian3s = this.cartesian3s;
            let points = this.points;
            // 这个也不对，根据某个点得到的平移矩阵平移其他的点时，跑到了很远的地方---》矩阵不对
            let midPoint = Cesium.Cartesian3.fromElements( points[0].x, points[0].y, points[0].z );
            const transitionMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(midPoint);

            let point = this.createPoint(midPoint,Cesium.Color.RED);
            let M = point.computeModelMatrix(Cesium.JulianDate.now());
            showAxis(
                { modelMatrix: M },
                this.viewer.scene,
                6000000
            );

            // 现在：以飞机的始发点/数据的第一个点位基准位/参考系的原点，计算出其他点的位置
            let normalized_translated_X = Cesium.Cartesian3.normalize( Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_X, new Cesium.Cartesian3() ), new Cesium.Cartesian3() );
            let normalized_translated_Y = Cesium.Cartesian3.normalize( Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3() ), new Cesium.Cartesian3() );
            let normalized_translated_Z = Cesium.Cartesian3.normalize( Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3() ), new Cesium.Cartesian3() );
            let _normalized_translated_X = Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_X, new Cesium.Cartesian3() );
            let _normalized_translated_Y = Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_Y, new Cesium.Cartesian3() );
            let _normalized_translated_Z = Cesium.Matrix4.multiplyByPoint( transitionMatrix, Cesium.Cartesian3.UNIT_Z, new Cesium.Cartesian3() );
            this.createPoint(_normalized_translated_X, Cesium.Color.GREEN)
            this.createPoint(_normalized_translated_Y, Cesium.Color.GREEN)
            this.createPoint(_normalized_translated_Z, Cesium.Color.GREEN)

            let lineWidth = 1000;
            let preLeft = [0, -lineWidth/2,0];
            let preRight = [0, lineWidth/2,0];
            let left = null;
            let right = null;
            let radiusOfEarth = 6378137.0;

            let arr = [];
            let len = cartesian3s.length
            for (let i = 0; i < len; i++) {
                // let curPos = Cesium.Cartesian3.fromElements(cartesian3s[i].x, cartesian3s[i].y, cartesian3s[i].z);
                // console.log("curPos", curPos);
                // arr.push(curPos.x);
                // arr.push(curPos.y);
                // arr.push(curPos.z);
                arr.push(cartesian3s[i].x);
                arr.push(cartesian3s[i].y);
                arr.push(cartesian3s[i].z);
            }

            // let point = this.createPoint(midPoint,Cesium.Color.RED);
            // // 现在：以飞机的始发点/数据的第一个点位基准位/参考系的原点，计算出其他点的位置
            // let M = point.computeModelMatrix(Cesium.JulianDate.now());
            // //

            this.imageUri = './imgs/fromShang/Dirlinetexture02.png';//128*128

            let primitive = this.drawStaticTriangles( arr );
            // [
            //     0, -500, 0,
            //     0, 500, 0,
            //     -10.9, 500, 1.3,
            //     -10.9, 500, 1.3,
            //     0, -500, 0,
            //     -10.9, -500, 1.3,
            //     // -200, 200, 0,
            //     // 200, 0, 0,
            //     // 200, 200, 0,
            // ]

        },

        /**
         * @description 画扇形
         * @param {int} lon 中心点经度
         * @param {*} lat 中心点纬度
         * @param {*} height 中心点高度
         * @param {*} direction 方向
         * @param {*} radius 半径
         */
        drawDynamicTrianglesByShader(modelCenter = Cesium.Cartesian3.fromElements(this.points[0].x, this.points[0].y, this.points[0].z), positionArray = this.points, prePositionArray, nextPositionArray) {
            // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
            const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);

            // const vertexShaderText = `
            // attribute vec3 position;

            // void main() {
            //     gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
            // }`;
            const vertexShaderText = `
            attribute vec3 position;
            attribute vec3 prePosition;
            attribute vec3 nextPosition;
            // it is not normal itself, but used to control lines drawing
            // attribute vec3 normal; // (point to use, offset sign, not used component)

            uniform float aspect;
            uniform float pixelSize;
            uniform float lineWidth;

            struct adjacentPoints {
                vec4 previous;
                vec4 current;
                vec4 next;
            };

            vec3 convertCoordinate(vec3 lonLatLev) {
                // WGS84 (lon, lat, lev) -> ECEF (x, y, z)
                // read https://en.wikipedia.org/wiki/Geographic_coordinate_conversion#From_geodetic_to_ECEF_coordinates for detail

                // WGS 84 geometric constants
                float a = 6378137.0; // Semi-major axis
                float b = 6356752.3142; // Semi-minor axis
                float e2 = 6.69437999014e-3; // First eccentricity squared

                float latitude = radians(lonLatLev.y);
                float longitude = radians(lonLatLev.x);

                float cosLat = cos(latitude);
                float sinLat = sin(latitude);
                float cosLon = cos(longitude);
                float sinLon = sin(longitude);

                float N_Phi = a / sqrt(1.0 - e2 * sinLat * sinLat);
                float h = particleHeight; // it should be high enough otherwise the particle may not pass the terrain depth test

                vec3 cartesian = vec3(0.0);
                cartesian.x = (N_Phi + h) * cosLat * cosLon;
                cartesian.y = (N_Phi + h) * cosLat * sinLon;
                cartesian.z = ((b * b) / (a * a) * N_Phi + h) * sinLat;
                return cartesian;
            }

            vec4 calculateProjectedCoordinate(vec3 lonLatLev) {
                // the range of longitude in Cesium is [-180, 180] but the range of longitude in the NetCDF file is [0, 360]
                // [0, 180] is corresponding to [0, 180] and [180, 360] is corresponding to [-180, 0]
                lonLatLev.x = mod(lonLatLev.x + 180.0, 360.0) - 180.0;
                vec3 particlePosition = convertCoordinate(lonLatLev); // 有必要进行这一步计算吗？暂时保留。
                vec4 projectedCoordinate = czm_modelViewProjection * vec4(particlePosition, 1.0);
                return projectedCoordinate;
            }

            vec4 calculateOffsetOnNormalDirection(vec4 pointA, vec4 pointB, float offsetSign) {
                vec2 aspectVec2 = vec2(aspect, 1.0);
                vec2 pointA_XY = (pointA.xy / pointA.w) * aspectVec2;
                vec2 pointB_XY = (pointB.xy / pointB.w) * aspectVec2;

                float offsetLength = lineWidth / 2.0;
                vec2 direction = normalize(pointB_XY - pointA_XY);
                vec2 normalVector = vec2(-direction.y, direction.x);
                normalVector.x = normalVector.x / aspect;//？ 为什么只算 X ？
                normalVector = offsetLength * normalVector;

                vec4 offset = vec4(offsetSign * normalVector, 0.0, 0.0);
                return offset;
            }

            void main() {
                // vec2 particleIndex = st;// ???

                // 这里接收的是三个点: 如何才能给到呢?  cur, pre, next ---> 这个怎么办？
                vec3 previousPosition = prePosition;//texture2D(previousParticlesPosition, particleIndex).rgb;
                vec3 currentPosition = position;//texture2D(currentParticlesPosition, particleIndex).rgb;
                vec3 nextPosition = nextPosition;//texture2D(postProcessingPosition, particleIndex).rgb;

                // 这句话不太清楚，先搁置
                // float isAnyRandomPointUsed = texture2D(postProcessingPosition, particleIndex).a + texture2D(currentParticlesPosition, particleIndex).a + texture2D(previousParticlesPosition, particleIndex).a;

                adjacentPoints projectedCoordinates;
                // if (isAnyRandomPointUsed > 0.0) {
                //     projectedCoordinates.previous = calculateProjectedCoordinate(previousPosition);
                //     projectedCoordinates.current = projectedCoordinates.previous;
                //     projectedCoordinates.next = projectedCoordinates.previous;
                // } else {
                    projectedCoordinates.previous = calculateProjectedCoordinate(previousPosition);
                    projectedCoordinates.current = calculateProjectedCoordinate(currentPosition);
                    projectedCoordinates.next = calculateProjectedCoordinate(nextPosition);
                // }

                int pointToUse = int(normal.x); // normal 怎么得到？
                float offsetSign = normal.y;
                vec4 offset = vec4(0.0);
                vec4 cur = vec4(0.0);
                // render lines with triangles and miter joint
                // read https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html for detail
                // 关于这里为什么有这样的判断，需要再次阅读上面链接的内容
                if (pointToUse == -1) {
                    offset = pixelSize * calculateOffsetOnNormalDirection(projectedCoordinates.previous, projectedCoordinates.current, offsetSign);
                    cur = projectedCoordinates.previous + offset;
                } else {
                    if (pointToUse == 0) {
                        offset = pixelSize * calculateOffsetOnMiterDirection(projectedCoordinates, offsetSign);
                        cur = projectedCoordinates.current + offset;
                    } else {
                        if (pointToUse == 1) {
                            offset = pixelSize * calculateOffsetOnNormalDirection(projectedCoordinates.current, projectedCoordinates.next, offsetSign);
                            cur = projectedCoordinates.next + offset;
                        } else {

                        }
                    }
                }

                gl_Position = czm_projection * czm_view * czm_model * cur;
            }`;
            const fragmentShaderText = `
            uniform vec3 u_color;

            void main(){
                gl_FragColor = vec4(u_color, 0.3);
            }`;

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
                    this.prePositionArray = option.prePositionArray;
                    this.nextPositionArray = option.nextPositionArray;
                    this.pixelSize = option.pixelSize;
                    this.lineWidth = option.lineWidth;
                }

                createVertexBufferByData(frameState) {
                    const positionBuffer = Cesium.Buffer.createVertexBuffer({
                        usage: Cesium.BufferUsage.STATIC_DRAW,
                        typedArray: new Float32Array(this.positionArray),
                        context: frameState.context,
                    });
                    const prePositionBuffer = Cesium.Buffer.createVertexBuffer({
                        usage: Cesium.BufferUsage.STATIC_DRAW,
                        typedArray: new Float32Array(this.prePositionArray),
                        context: frameState.context,
                    });
                    const nextPositionBuffer = Cesium.Buffer.createVertexBuffer({
                        usage: Cesium.BufferUsage.STATIC_DRAW,
                        typedArray: new Float32Array(this.nextPositionArray),
                        context: frameState.context,
                    });

                    // 这里的 normal 要结合当前 position 的 orientation 去计算 --- 一定需要吗？ 如果不加会怎么样？
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

                    const vertexArray = new Cesium.VertexArray({
                        context: frameState.context,
                        attributes: [
                            {
                                index: 0,
                                vertexBuffer: positionBuffer,
                                componentsPerAttribute: 3,
                                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            },
                            {
                                index: 1,
                                vertexBuffer: prePositionBuffer,
                                componentsPerAttribute: 3,
                                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            },
                            {
                                index: 2,
                                vertexBuffer: nextPositionBuffer,
                                componentsPerAttribute: 3,
                                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                            },
                            // {
                            //     index: 1,
                            //     vertexBuffer: normalBuffer,
                            //     componentsPerAttribute: 3,
                            //     componentDatatype: Cesium.ComponentDatatype.FLOAT
                            // }
                        ],
                    });
                    return vertexArray;
                }

                createCommand(frameState, matrix) {
                    const attributeLocations = {
                        position: 0,
                        prePosition: 1,
                        nextPosition: 2,
                    };
                    const uniformMap = {
                        u_color() {
                            // return Cesium.Color.HONEYDEW
                            return Cesium.Color.RED;
                        },
                        /*
                            uniform float aspect;
                            uniform float pixelSize;
                            uniform float lineWidth;
                        */
                        aspect: function () {
                            return frameState.context.drawingBufferWidth / frameState.context.drawingBufferHeight;
                        },
                        pixelSize: function () {
                            return this.pixelSize;
                        },
                        lineWidth: function () {
                            return this.lineWidth;
                        },
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
                    });
                    return new Cesium.DrawCommand({
                        // primitiveType: this.primitiveType,//默认就是 PrimitiveType.TRIANGLE
                        modelMatrix: matrix,
                        vertexArray: vertexArray,
                        shaderProgram: program,
                        uniformMap: uniformMap,
                        renderState: renderState,
                        pass: Cesium.Pass.OPAQUE,
                    });
                }

                /**
                 * @param {FrameState} frameState
                 */
                update(frameState) {
                    if (this.preExecute) {
                        this.preExecute();
                    }

                    const command = this.createCommand( frameState, this._modelMatrix );
                    frameState.commandList.push(command);
                }
            }

            // try!
            // const viewer = new Cesium.Viewer('cesiumContainer', {
            //   contextOptions: {
            //     requestWebgl2: true
            //   }
            // })

            // use a smaller earth radius to make sure distance to camera > 0
            let globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0);
            let pixelSize = this.viewer.camera.getPixelSize(
                globeBoundingSphere,
                this.viewer.scene.drawingBufferWidth,
                this.viewer.scene.drawingBufferHeight
            );
            let lineWidth = 100.0;

            this.viewer.scene.globe.depthTestAgainstTerrain = true;
            let primitive = this.viewer.scene.primitives.add(
                new StaticTrianglePrimitive({
                    modelMatrix: modelMatrix,
                    positionArray: positionArray,
                    prePositionArray: prePositionArray,
                    nextPositionArray: nextPositionArray,
                    pixelSize: pixelSize,
                    lineWidth: lineWidth,
                })
            );
            return primitive;
        },
        drawStaticTriangles(typedArray,stArray,normalsArray) {
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

            var imageUri = this.imageUri;
            console.log('%c [ imageUri ]-2769', 'font-size:13px; background:pink; color:#bf2c9f;', imageUri)
            Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                console.log('image loaded!');
                var vtxfTexture;
                var context = that.viewer.scene.context;
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
            this.viewer.scene.globe.depthTestAgainstTerrain = true;
            let primitive = this.viewer.scene.primitives.add(
                new StaticTrianglePrimitive({
                    modelMatrix: modelMatrix,
                    positionArray: typedArray,
                    stArray: stArray,
                    // normalsArray:normalsArray,
                })
            );
            return primitive;
        },
        drawDynamicTriangles(option) {
            /*  option:{
                    typedArray,
                    stArray,
                    normalsArray,
                    time
                }
            */

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
            uniform float u_alpha;
            uniform float u_time;
            uniform sampler2D image;

            varying vec3 v_positionEC;
            varying vec2 v_st;

            void main(){
                czm_materialInput materialInput;
                // materialInput.positionToEyeEC = v_positionEC;
                materialInput.st = v_st;

                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st*10.0;
                vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                material.alpha = colorImage.a * u_alpha;
                material.diffuse = colorImage.rgb * u_color.rgb;

                gl_FragColor = vec4(material.diffuse , material.alpha);
            }`;

            let that = this;
            // 1.5 定义纹理
            var texture = undefined;
            let u_color = new Cesium.Color(1.0, 1.0, 1.0, 1.0);
            let u_alpha = 1.0;
            let u_time = 0.5;

            var imageUri = this.imageUri;
            Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                console.log('image loaded!');
                var vtxfTexture;
                var context = that.viewer.scene.context;
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
            class DynamicTrianglePrimitive {
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
                createVertexBufferByDataUseIndices(frameState) {
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
                            // return Cesium.Color.RED;
                            // return new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                            return u_color;
                        },
                        u_alpha() {
                            return u_alpha;
                        },
                        u_time() {
                            u_time += 0.001;
                            if (u_time > 1.0) {
                                u_time = 0.0;
                            }
                            return u_time;
                        },
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

            this.viewer.scene.globe.depthTestAgainstTerrain = true;
            let primitive = this.viewer.scene.primitives.add(
                new DynamicTrianglePrimitive({
                    modelMatrix: modelMatrix,
                    positionArray: option.typedArray,
                    stArray: option.stArray,
                    // time: option.time,
                    // normalsArray:normalsArray,
                })
            );

            return primitive;
        },

        drawCommandAndCustomPrimitive(coords, colors) {
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

            let geometry = this.createSegmentsGeometry(coords);

            let segments = new CustomPrimitive({
                commandType: "Draw",
                attributeLocations: {
                    normal: 0,
                    st: 1,
                },
                geometry: geometry,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                uniformMap: {
                    posotion: function () {
                        return coords;
                    },
                    color: function () {
                        return colors;
                    },
                },
                vertexShaderSource: new Cesium.ShaderSource({
                    // sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.vert')]
                    sources: [vsSource],
                }),
                fragmentShaderSource: new Cesium.ShaderSource({
                    // sources: [Util.loadText(fileOptions.glslDirectory + 'segmentDraw.frag')]
                    sources: [fsSource],
                }),
                rawRenderState: Util.createRawRenderState({
                    // undefined value means let Cesium deal with it
                    viewport: undefined,
                    depthTest: {
                        enabled: true,
                    },
                    depthMask: true,
                }),
                // framebuffer: this.framebuffers.segments,
                framebuffer: undefined,
                autoClear: true,
            });

            this.viewer.scene.primitives.add(segments);
        },

        // for  Line --- 飞机与地面站之间的连线
        lineForTargetAndAirplane() {
            //   效果： 不停的运动
            //  初步思路：
            //  1. 确定关于开始 draw 的判断条件
            //  2. draw 的方式
            //   2.1 确定 2 个点
            //   2.2 将两个点 在相同的方向上 分别平移相同距离，得到 4 个点
            //   2.3 将这4个点，画2个 Triangle
            //   2.4 添加 materials，对比 C端，要会动（关于动的方向，在实现之后看看可以不可以调整）
            let posA = new Cesium.Cartesian3.fromElements(this.cartesian3s[0].x, this.cartesian3s[0].y, this.cartesian3s[0].z);
            // let posA = new Cesium.Cartesian3.fromDegrees(115.20, 38.56, 600000);
            let posB = new Cesium.Cartesian3.fromDegrees(116.20, 39.56, 600000);
            let pointA = this.createPoint(posA);
            let pointB = this.createPoint(posB);

            let MA = pointA.computeModelMatrix(Cesium.JulianDate.now());
            let MB = pointB.computeModelMatrix(Cesium.JulianDate.now());
            showAxis(
                { modelMatrix: MA },
                this.viewer.scene,
                6000000
            );
            showAxis(
                { modelMatrix: MB },
                this.viewer.scene,
                6000000
            );
            // 先尝试让各个点沿着本身frame的 X 轴平移一段距离
            // let XA = Cesium.Matrix4.multiplyByPoint(MA, Cesium.Cartesian3.UNIT_X, new Cesium.Cartesian3())
            // let XA_n = Cesium.Cartesian3.normalize(XA, new Cesium.Cartesian3())
            // let XB = Cesium.Matrix4.multiplyByPoint(MA, Cesium.Cartesian3.UNIT_X, new Cesium.Cartesian3())
            // let XB_n = Cesium.Cartesian3.normalize(XB, new Cesium.Cartesian3())
            // this.createPoint(XA,Cesium.Color.RED);
            // this.createPoint(XB, Cesium.Color.RED);
            // translatePointAlongAxis()
            let width = 10000;
            let A = translatePointAlongAxis(posA, { x: width/2, y: 0, z: 0, });
            let A_neg = translatePointAlongAxis(posA, { x: -width/2, y: 0, z: 0, });
            this.createPoint(A, Cesium.Color.RED);
            this.createPoint(A_neg, Cesium.Color.RED);
            let B = translatePointAlongAxis(posB, { x: width/2, y: 0, z: 0, });
            let B_neg = translatePointAlongAxis(posB, { x: -width/2, y: 0, z: 0, });
            this.createPoint(B, Cesium.Color.RED);
            this.createPoint(B_neg, Cesium.Color.RED);

            // 画三角形
            // 用 DrawCommand
            // 计算顶点
            let posArr = [];

            // 1-2-3-3-4-1
            posArr.push(A.x)
            posArr.push(A.y)
            posArr.push(A.z)

            posArr.push(A_neg.x)
            posArr.push(A_neg.y)
            posArr.push(A_neg.z)

            posArr.push(B_neg.x)
            posArr.push(B_neg.y)
            posArr.push(B_neg.z)

            posArr.push(B_neg.x)
            posArr.push(B_neg.y)
            posArr.push(B_neg.z)

            posArr.push(B.x)
            posArr.push(B.y)
            posArr.push(B.z)

            posArr.push(A.x)
            posArr.push(A.y)
            posArr.push(A.z)

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
            // 让一个纹理 repeat
            // let stArr = [];
            // let st_y = [0, 0, 1, 1, 1, 0];
            // let st_x = [0, 1, 1, 1, 0, 0];
            // let stamp = 3000;// 多久 repeat 一次 ，其实是长度，geometry上的一段
            // // 利用距离
            // // let distance = Cesium.Cartesian3.distance(posA, posB);
            // let vector = Cesium.Cartesian3.subtract(posA, posB, new Cesium.Cartesian3());
            // let normalize_vector = Cesium.Cartesian3.normalize(vector,new Cesium.Cartesian3());
            // // 如何把距离分成几份去使用？
            // for (let j = 0; j < stamp; j++){
            //     for (let p = 0; p < st_y.length; p++){
            //         stArr.push(st_x[p]);
            //         stArr.push( st_y[p] / stamp );
            //     }
            //     for (let p = 0; p < st_y.length; p++){
            //         st_y[p]++;
            //     }
            // }
            // // 如何在不用知道 总距离的基础上，进行repeat ----》 如果能在 shader里面计算，感觉会很香
            // //
            // for (let j = 0; j < stamp; j++){
            //     for (let p = 0; p < st_y.length; p++){
            //         stArr.push(st_x[p]);
            //         stArr.push( st_y[p] / stamp );
            //     }
            //     for (let p = 0; p < st_y.length; p++){
            //         st_y[p]++;
            //     }
            // }

            // 确定纹理图片
            this.imageUri = './imgs/fromLW/rectangle-T_trans.png';
            // this.imageUri = './imgs/fromLW/rectangle-S_trans.png';

            // this.drawStaticTriangles(posArr, stArr);
            let primitive = this.drawDynamicTriangles({
                typedArray:posArr,
                stArray:stArr,
                // normalsArray,
                // time:0
            });

            // this.viewer.camera.flyTo({
            //     destination: posA,
            // });
        },

        // Radar
        customRadarByDrawCommand() {
            let targetPos = new Cesium.Cartesian3.fromDegrees(116.20, 39.56);
            let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(targetPos);

            this.viewer.camera.flyTo({
                destination:new Cesium.Cartesian3.fromDegrees(116.20, 39.56,10000),
            })
            this.createPoint(targetPos);

            let origin = [0, 0, 0];
            let numOfPoints = 40;//建议最少每个扇形 40 个点
            let radius = 50000.0;

            let numbersOfDivide = 60;// 选60 是因为可以被2，3整除，这样的话后期想取曲面的一部分的时候便于计算
            let radiusOfCircle = Math.PI * 2;//从 X轴 正向开始算，沿着Y轴正向转
            // 先得到一个扇形的点，画出来
            // 然后旋转后得到 CurveSurface 的点，画出来
            let getSectorPoints = (p1,p2,p3,p4) => {
                let points = BezierBy4Point(p1,p2,p3,p4,numOfPoints);// 100 means get 100 points on this Bezier Curve
                return points;
            };
            let dealWithCirclePoints = (points) => {
                let arrangedPoints = [];
                for (let i = 1; i < numOfPoints - 1 - 1; i++){
                    arrangedPoints.push(...points[i-1])
                    arrangedPoints.push(...points[i])
                    arrangedPoints.push(...points[numOfPoints - 1])
                }
                // 乘上box的长度
                let boxVertex = arrangedPoints.map(function (v) {
                    return v * radius * 2;
                });
                return boxVertex;
            };

            // 关于 纹理坐标，当前模型不需要纹理
            let drawDynamicSector = (option)=>{
                /*  option:{
                        matrix:modelMatrix,
                        typedArray,
                        stArray,
                        normalsArray,
                        time,
                        color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                        alpha:1.0
                    }
                */

                // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
                // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
                const modelMatrix = option.matrix;// Cesium.Matrix4.IDENTITY;

                const vertexShaderText = `
                    attribute vec3 position;
                    attribute vec3 normal;
                    attribute vec2 st;
                    attribute float batchId;

                    // varying vec3 v_positionEC;
                    // varying vec3 v_normalEC;
                    // varying vec2 v_st;

                    void main() {
                        vec4 p = vec4(position,1.0);

                        // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                        // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                        // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                        // v_st = st;

                        // v_normal = czm_normal;// * normal;
                        // v_normalEC = normal;
                        // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

                        // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
                        gl_Position = czm_projection * czm_view * czm_model * p;
                        // gl_Position = czm_modelViewProjectionRelativeToEye * p;
                    }
                `;

                const fragmentShaderText = `
                    uniform vec4 u_color;
                    uniform float u_alpha;
                    // uniform float u_time;
                    // uniform sampler2D image;

                    varying vec3 v_positionEC;
                    // varying vec2 v_st;

                    void main(){
                        czm_materialInput materialInput;
                        // materialInput.positionToEyeEC = v_positionEC;
                        // materialInput.st = v_st;

                        czm_material material = czm_getDefaultMaterial(materialInput);
                        // vec2 st = materialInput.st*10.0;
                        // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                        // material.alpha = colorImage.a * u_alpha;
                        // material.diffuse = colorImage.rgb * u_color.rgb;
                        material.alpha = u_alpha;
                        material.diffuse = u_color.rgb;

                        gl_FragColor = vec4(material.diffuse , material.alpha);
                    }
                `;

                let that = this;
                // 1.5 定义纹理
                var texture = undefined;
                let u_color = option.color ? option.color : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                let u_alpha = option.alpha ? option.alpha : 1.0;

                // var imageUri = this.imageUri;
                // Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                //     console.log('image loaded!');
                //     var vtxfTexture;
                //     var context = that.viewer.scene.context;
                //     if (Cesium.defined(image.internalFormat)) {
                //         vtxfTexture = new Cesium.Texture({
                //             context: context,
                //             pixelFormat: image.internalFormat,
                //             width: image.width,
                //             height: image.height,
                //             source: {
                //                 arrayBufferView: image.bufferView
                //             }
                //         });
                //     } else {
                //         vtxfTexture = new Cesium.Texture({
                //             context: context,
                //             source: image
                //         });
                //     }

                //     texture = vtxfTexture;
                // });

                class DynamicSectorPrimitive {
                    /**
                     * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
                     */
                    constructor(option = {}) {
                        this._modelMatrix = option.modelMatrix;
                        // this.createCommand = null
                        this.preExecute = option.preExecute;
                        this.positionArray = option.positionArray;
                        // this.normalsArray = option.normalsArray;
                        // this.stArray = option.stArray;
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
                        // const stBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Float32Array(this.stArray),
                        //     context: frameState.context,
                        // });

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
                                // {
                                //     index: 1, // 等于 attributeLocations['position']
                                //     vertexBuffer: stBuffer,
                                //     componentsPerAttribute: 2,
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                // },
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
                                // textureCoordinates: new Cesium.GeometryAttribute({
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                //     componentsPerAttribute: 2,
                                //     values: this.stArray
                                // })
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
                            // textureCoordinates: 1,
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
                            // image: function() {
                            //     if (Cesium.defined(texture)) {
                            //         return texture;
                            //     } else {
                            //         return frameState.context.defaultTexture;
                            //     }
                            // }
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

                this.viewer.scene.globe.depthTestAgainstTerrain = true;
                let primitive = this.viewer.scene.primitives.add(
                    new DynamicSectorPrimitive({
                        modelMatrix: modelMatrix,
                        positionArray: option.typedArray,
                        stArray: option.stArray,
                        // time: option.time,
                        // normalsArray:normalsArray,
                    })
                );

                return primitive;
            }

            // 包括 2个 geometry： 雷达模型和雷达扇页
            // 在 clip space 中完成 geometry 的确定和创建

            // 雷达扇页
            // X_positive
            let start_X_pos = [0, 0, 0];
            let end_X_pos = [0.5, 0, 0];
            // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
            let referP1_X_pos = [0.125,0,0.25];//start 和 midOfStartEndOnTop 的 中点
            let referP2_X_pos = [0.375, 0, 0.25];//end 和 midOfStartEndOnTop 的 中点
            let pointX_pos = getSectorPoints(start_X_pos,referP1_X_pos,referP2_X_pos,end_X_pos);
            drawDynamicSector({
                matrix: modelMatrix,
                typedArray: dealWithCirclePoints(pointX_pos),
                // stArray,
                // normalsArray,
                // time
            });
            // X_negative
            let start_X_neg = [0, 0, 0];
            let end_X_neg = [-0.5, 0, 0];
            // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
            let referP1_X_neg = [-0.125,0,0.25];//start 和 midOfStartEndOnTop 的 中点
            let referP2_X_neg = [-0.375, 0, 0.25];//end 和 midOfStartEndOnTop 的 中点
            let pointX_neg = getSectorPoints(start_X_neg, referP1_X_neg, referP2_X_neg, end_X_neg);
            // drawDynamicSector({
            //     matrix: modelMatrix,
            //     typedArray: dealWithCirclePoints(pointX_neg),
            //     // stArray,
            //     // normalsArray,
            //     // time
            // });
            // Y_positive
            let start_Y_pos = [0, 0, 0];
            let end_Y_pos = [0, 0.5, 0];
            // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
            let referP1_Y_pos = [0, 0.125, 0.25];//start 和 midOfStartEndOnTop 的 中点
            let referP2_Y_pos = [0, 0.375, 0.25];//end 和 midOfStartEndOnTop 的 中点
            let pointY_pos = getSectorPoints(start_Y_pos,referP1_Y_pos,referP2_Y_pos,end_Y_pos);
            // drawDynamicSector({
            //     matrix: modelMatrix,
            //     typedArray: dealWithCirclePoints(pointY_pos),
            //     // stArray,
            //     // normalsArray,
            //     // time
            // });
            // Y_negative
            let start_Y_neg = [0, 0, 0];
            let end_Y_neg = [ 0, -0.5, 0];
            // let midOfStartEndOnTop = [0.25, 0, 0.5];// start 和 end 的 中点，然后 along z axis 放到最上面
            let referP1_Y_neg = [0, -0.125, 0.25];//start 和 midOfStartEndOnTop 的 中点
            let referP2_Y_neg = [0, -0.375, 0.25];//end 和 midOfStartEndOnTop 的 中点
            let pointY_neg = getSectorPoints(start_Y_neg, referP1_Y_neg, referP2_Y_neg, end_Y_neg);
            // drawDynamicSector({
            //     matrix: modelMatrix,
            //     typedArray: dealWithCirclePoints(pointY_neg),
            //     // stArray,
            //     // normalsArray,
            //     // time
            // });

            // 雷达体
            // 直接找特定的点吧 --- 也是 Bezier ？ 要得到一个精度足够的圆。----再观察之后发现，雷达体的面的每一个小的平面并不是一个曲面，所以，关键是利用现有的扇形的点，在所在XY平面得到一个对应的圆弧

            let pointsForRadarStructure = [];
            function getPointsOfRadarStructure(start,end,numOfPoints = 10){
                let p_forCircle = [ start[0], end[1], start[2] ];// 当前的 x，y，以及 此时的z，也即此时所在的z平面
                let p_1 = [
                    (start[0] + p_forCircle[0]) / 2,
                    (start[1] + p_forCircle[1]) / 2,
                    start[2],// 因为 z 分量 没变化
                ]
                let p_2 = [
                    (end[0] + p_forCircle[0]) / 2,
                    (end[1] + p_forCircle[1]) / 2,
                    end[2],// 因为 z 分量 没变化
                ]
                // console.log('x_pos', x_pos, 'p_1  ', p_1,'p_2  ', p_2,'y_pos', y_pos)
                let pointss = getPoints(start, p_1, p_2, end, numOfPoints);//现在的问题是画线有问题，不过可以尝试用这些点画三角形，看看是不是能画出来一个平面

                return pointss;
            }

            let getCurXYPointsInClipSpace = (startPos) => {
                /*  startPos ---这个点是 X 轴 正方向上的点，
                    从这个点开始，以 x坐标值 为半径，沿 Y轴正方向旋转 一圈，得到一个可以构成一个圆的点。
                    在得到点的过程中，可以设置：
                        1. 得到半圆还是 四分之一圆。
                        2. 构成当前圆的点的数量，即：当前圆被分割成多少份。（是整个圆，而不是想要显示的那部分圆，这个后期加上）
                 */
                let curRadius = startPos[0];

                let pointOnCircle = [];
                for (let i = 0; i <= numbersOfDivide; i++){
                    // let curAngle = i * 360 / numbersOfDivide;
                    let curAngle = i * radiusOfCircle / numbersOfDivide;//看来还是得用弧度

                    let a = Math.cos(curAngle) * curRadius;
                    let b = Math.sin(curAngle) * curRadius;
                    let c = startPos[2];

                    pointOnCircle.push([a,b,c])
                }

                return pointOnCircle;
            }

            let pointsNum = numbersOfDivide;
            let cur = [];
            for (let p = 0; p < pointX_pos.length ;p++){

                cur.push(getCurXYPointsInClipSpace(pointX_pos[p]));
                // if (p == 0 || p == pointX_pos.length - 1) { continue; }
                // let x_pos = pointX_pos[p];
                // let x_neg = pointX_neg[p];
                // let y_pos = pointY_pos[p];
                // let y_neg = pointY_neg[p];

                // 在 XY 平面进行 贝塞尔曲线的求得 : z 分量不变
                // x_pos
                // y_pos
                // let mid_xng = [
                //     (x_pos[0] + y_pos[0]) / 2,
                //     (x_pos[1] + y_pos[1]) / 2,
                //     (x_pos[2] + y_pos[2]) / 2,
                // ];
                // 此时在 clip space中，
                // 每 2 个点 以及另外一个可以构成 一个在当前XY平面内的 等腰三角形，其实是 变长为 radius / R 的正方形的一半，
                // let XpYp = getPointsOfRadarStructure(x_pos, y_pos, pointsNum);

                // y_pos
                // x_neg
                // let YpXn = getPointsOfRadarStructure(y_pos, x_neg, 10);
                // let YpXn = getPointsOfRadarStructure(x_neg, y_pos,  pointsNum);

                // x_neg
                // y_neg
                // let XnYn = getPointsOfRadarStructure(x_neg, y_neg, pointsNum);

                // y_neg
                // x_pos
                // let YnXp = getPointsOfRadarStructure(y_neg, x_pos, 10);
                // let YnXp = getPointsOfRadarStructure(x_pos, y_neg,  pointsNum);

                // cur.push(...XpYp);
                // cur.push(...YpXn);
                // cur.push(...XnYn);
                // cur.push(...YnXp);

                // pointsForRadarStructure.push(cur);// 验证一个问题： 如果传入的4个点都在 XY 平面，是否能够生成对应点集 --- 得到的点的集合要是一段一段的才行

            }
            // console.log("cur", cur.length);// [ [ [x,y,z] ], ... ]

            // 先画面，
            // 这些点怎么用:
            //  1. 先处理成 每一个沿 Z轴 切面的圆弧的点 -- 这样浪费内存
            //  2. 然后处理点
            let radarCurveSurfacePoints = [];
            for (let i = 1; i <= pointsNum; i++) {
                for (let p = 1; p < cur.length; p++) {
                    // cur 里的每一组数据里取 相同 index, index - 1  的数据
                    let a = cur[p - 1][i - 1];
                    let b = cur[p - 1][i];
                    let c = cur[p][i - 1];
                    let d = cur[p][i];

                    // a-b-c-b-c-d
                    radarCurveSurfacePoints.push(...a)
                    radarCurveSurfacePoints.push(...b)
                    radarCurveSurfacePoints.push(...c)
                    radarCurveSurfacePoints.push(...b)
                    radarCurveSurfacePoints.push(...c)
                    radarCurveSurfacePoints.push(...d)
                }
            }
            // 乘上box的长度
            let boxVertex = radarCurveSurfacePoints.map(function (v) {
                return v * radius * 2;
            });
            drawDynamicSector({
                matrix: modelMatrix,
                typedArray: boxVertex,
                // stArray,
                // normalsArray,
                // time
                color:new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                alpha:0.4
            });


            // 再画线。
            // for Draw line along Radius
            // for (let q = 0; q < pointsForRadarStucture.length; q++){
            //     // pointsForRadarStucture[q];// Array
            //     // 为了 能画出线，每2个点
            // }



            // 测试完毕： 使用其中的 byDegrees 方式
            let testPointCanBeACircleOrNot = () => {
                // 思路是： 每2个点和圆心组成一个三角形。
                // 中间结论：通过函数内的方式可以得到对应的点，但是组成的圆不是很规整。原因在于点的计算。
                // 最终结论： 可以通过每次旋转一个角度，然后得到对应的点
                let demoFinalPos = [];
                let byBezier = () => {
                    let demoPos = pointsForRadarStructure[10];//39 , pointsForRadarStructure: <Array>Array, demoPos//27: <lon,lat,alt>Array
                    for (let p = 1; p < demoPos.length; p++){
                        demoFinalPos.push(...demoPos[p-1])
                        demoFinalPos.push(...demoPos[p])
                        // demoFinalPos.push(...demoPos[demoPos.length - 1])
                        demoFinalPos.push(...[0.0,0.0,demoPos[0][2]])
                    }
                }
                let byDegrees = () => {
                    let numbersOfDivide = 20;
                    let cusPosInClipSpace = pointX_pos[5];//利用这个 点，以及 半径，每一份所对应的圆心角，计算出每个点的位置

                    let pointOnCircle = getCurXYPointsInClipSpace(cusPosInClipSpace, Math.PI/2, numbersOfDivide);
                    // above 得到圆上的所有点 --- 得到这些点之后就可以利用这些点画 曲面 了
                    // next： 每 2 个点链接圆心画 三角形
                    let curCenter = [0.0, 0.0, cusPosInClipSpace[2]];
                    for (let i = 1; i < pointOnCircle.length ; i++ ){// pointOnCircle: [ [lon,lat,alt], ... ]
                        demoFinalPos.push(...pointOnCircle[i-1]);
                        demoFinalPos.push(...pointOnCircle[i]);
                        demoFinalPos.push(...curCenter);
                    }

                };
                byDegrees()
                // 乘上box的长度
                let boxVertex = demoFinalPos.map(function (v) {
                    return v * radius * 2;
                });

                let testForDrawTriangleByPointX_pos = () => {
                    let dataTest = [];
                    // pointX_pos
                    let index_ = 20
                    let a = pointX_pos[index_];
                    let b = pointY_pos[index_];
                    let c = pointX_neg[index_];
                    let d = pointY_neg[index_];
                    let o = [0.0, 0.0, a[2]];

                    dataTest.push(...[ a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]);
                    dataTest.push(...[ b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]);
                    dataTest.push(...[ o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]);

                    dataTest.push(...[ b[0] * radius * 2, b[1] * radius * 2, b[2] * radius * 2]);
                    dataTest.push(...[ c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]);
                    dataTest.push(...[ o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]);

                    dataTest.push(...[ c[0] * radius * 2, c[1] * radius * 2, c[2] * radius * 2]);
                    dataTest.push(...[ d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]);
                    dataTest.push(...[ o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]);

                    dataTest.push(...[ d[0] * radius * 2, d[1] * radius * 2, d[2] * radius * 2]);
                    dataTest.push(...[ a[0] * radius * 2, a[1] * radius * 2, a[2] * radius * 2]);
                    dataTest.push(...[o[0] * radius * 2, o[1] * radius * 2, o[2] * radius * 2]);

                    return dataTest;
                }
                // boxVertex = testForDrawTriangleByPointX_pos()

                drawDynamicSector({
                    matrix: modelMatrix,
                    typedArray: boxVertex,
                    // stArray,
                    // normalsArray,
                    // time
                });
            }
            // testPointCanBeACircleOrNot();

            let drawStaticLine = (option)=>{
                /*  option:{
                        matrix:
                        typedArray,
                        stArray,
                        normalsArray,
                        time
                    }
                */
                let viewer = this.viewer;

                const modelMatrix = option.matrix ? option.matrix :  Cesium.Matrix4.IDENTITY;

                const vertexShaderText = `
                attribute vec3 position;
                // attribute vec3 normal;
                // attribute vec2 st;
                attribute float batchId;

                // varying vec3 v_positionEC;
                // varying vec3 v_normalEC;
                // varying vec2 v_st;

                void main() {
                    vec4 p = vec4(position,1.0);

                    // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                    // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                    // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                    // v_st = st;

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
                // uniform sampler2D image;

                // varying vec3 v_positionEC;
                // varying vec2 v_st;

                void main(){
                    czm_materialInput materialInput;
                    // materialInput.positionToEyeEC = v_positionEC;
                    // materialInput.st = v_st;

                    czm_material material = czm_getDefaultMaterial(materialInput);
                    // vec2 st = materialInput.st;//*10.0;
                    // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                    // vec4 colorImage = texture2D(image, vec2(st.s, st.t));
                    // material.alpha = colorImage.a * u_alpha;
                    // material.diffuse = colorImage.rgb * u_color.rgb;
                    material.alpha = u_alpha;
                    material.diffuse = u_color.rgb;

                    gl_FragColor = vec4(material.diffuse , material.alpha);
                }`;

                // 1.5 定义纹理
                let u_color = option.color ? option.color : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                let u_alpha = option.alpha ? option.alpha : 1.0;


                /* ----- See Here ↓ ------ */
                class LineDCPrimitive {
                    /**
                     * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
                     */
                    constructor(option = {}) {
                        this._modelMatrix = option.modelMatrix;
                        // this.createCommand = null
                        this.preExecute = option.preExecute;
                        this.positionArray = option.positionArray;
                        // this.normalsArray = option.normalsArray;
                        // this.stArray = option.stArray;
                    }

                    createVertexBufferByData(frameState) {
                        const positionBuffer = Cesium.Buffer.createVertexBuffer({
                            usage: Cesium.BufferUsage.STATIC_DRAW,
                            typedArray: new Float64Array(this.positionArray),
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
                        // const stBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Float32Array(this.stArray),
                        //     context: frameState.context,
                        // });

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
                                // {
                                //     index: 1, // 等于 attributeLocations['position']
                                //     vertexBuffer: stBuffer,
                                //     componentsPerAttribute: 2,
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                // },
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

                    createCommand(frameState, matrix) {
                        const attributeLocations = {
                            position: 0,
                            // st: 1,
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
                            // image: function() {
                            //     if (Cesium.defined(texture)) {
                            //         return texture;
                            //     } else {
                            //         return frameState.context.defaultTexture;
                            //     }
                            // }
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
                            // primitiveType: Cesium.PrimitiveType.POINTS,//默认就是 PrimitiveType.TRIANGLE
                            // primitiveType: Cesium.PrimitiveType.LINES,//默认就是 PrimitiveType.TRIANGLE
                            primitiveType: Cesium.PrimitiveType.LINE_STRIP,//默认就是 PrimitiveType.TRIANGLE
                            // primitiveType: Cesium.PrimitiveType.LINE_LOOP,//默认就是 PrimitiveType.TRIANGLE
                            modelMatrix: matrix,
                            vertexArray: vertexArray,
                            shaderProgram: program,
                            uniformMap: uniformMap,
                            renderState: renderState,
                            pass: Cesium.Pass.TRANSLUCENT,// 此时的线才能是 solid line ，
                            // pass: Cesium.Pass.OPAQUE,// 此时 line 不管PrimitiveType怎么变，画出来的都是虚线
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
                    new LineDCPrimitive({
                        modelMatrix: modelMatrix,
                        positionArray: option.typedArray,
                        stArray: option.stArray,
                        // time: option.time,
                        // normalsArray:normalsArray,
                    })
                );

                return primitive;
            }



            let drawDynamicSector_R = (option)=>{
                /*  option:{
                        matrix:modelMatrix,
                        typedArray,
                        stArray,
                        normalsArray,
                        time,
                        color:new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                    }
                */

                // const modelCenter = Cesium.Cartesian3.fromDegrees(112, 23, 0)
                // const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelCenter);
                const modelMatrix = option.matrix;// Cesium.Matrix4.IDENTITY;

                const vertexShaderText = `
                    attribute vec3 position;
                    attribute vec3 normal;
                    attribute vec2 st;
                    attribute float batchId;

                    // varying vec3 v_positionEC;
                    // varying vec3 v_normalEC;
                    // varying vec2 v_st;

                    void main() {
                        vec4 p = vec4(position,1.0);

                        // v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
                        // v_positionEC = (czm_modelView * p).xyz;      // position in eye coordinates
                        // v_normalEC = czm_normal * normal;                         // normal in eye coordinates
                        // v_st = st;

                        // v_normal = czm_normal;// * normal;
                        // v_normalEC = normal;
                        // v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;

                        // gl_Position = czm_projection * czm_view * czm_model * vec4(position, 1.0);
                        gl_Position = czm_projection * czm_view * czm_model * p;
                        // gl_Position = czm_modelViewProjectionRelativeToEye * p;
                    }
                `;

                const fragmentShaderText = `
                    uniform vec4 u_color;
                    uniform float u_alpha;
                    // uniform float u_time;
                    // uniform sampler2D image;

                    varying vec3 v_positionEC;
                    // varying vec2 v_st;

                    void main(){
                        czm_materialInput materialInput;
                        // materialInput.positionToEyeEC = v_positionEC;
                        // materialInput.st = v_st;

                        czm_material material = czm_getDefaultMaterial(materialInput);
                        // vec2 st = materialInput.st*10.0;
                        // vec4 colorImage = texture2D(image, vec2(fract(st.s), fract(st.t-u_time*10.0)));
                        // material.alpha = colorImage.a * u_alpha;
                        // material.diffuse = colorImage.rgb * u_color.rgb;
                        material.alpha = u_alpha;
                        material.diffuse = u_color.rgb;

                        gl_FragColor = vec4(material.diffuse , material.alpha);
                    }
                `;

                let that = this;
                // 1.5 定义纹理
                var texture = undefined;
                let u_color = option.color ? option.color : new Cesium.Color(1.0, 1.0, 1.0, 1.0);
                let u_alpha = option.alpha ? option.alpha : 1.0;

                // var imageUri = this.imageUri;
                // Cesium.Resource.createIfNeeded(imageUri).fetchImage().then(function(image) {
                //     console.log('image loaded!');
                //     var vtxfTexture;
                //     var context = that.viewer.scene.context;
                //     if (Cesium.defined(image.internalFormat)) {
                //         vtxfTexture = new Cesium.Texture({
                //             context: context,
                //             pixelFormat: image.internalFormat,
                //             width: image.width,
                //             height: image.height,
                //             source: {
                //                 arrayBufferView: image.bufferView
                //             }
                //         });
                //     } else {
                //         vtxfTexture = new Cesium.Texture({
                //             context: context,
                //             source: image
                //         });
                //     }

                //     texture = vtxfTexture;
                // });

                class DynamicSectorPrimitive {
                    /**
                     * @param {Matrix4} modelMatrix matrix to WorldCoordinateSystem
                     */
                    constructor(option = {}) {
                        this._modelMatrix = option.modelMatrix;
                        // this.createCommand = null
                        this.preExecute = option.preExecute;
                        this.positionArray = option.positionArray;
                        // this.normalsArray = option.normalsArray;
                        // this.stArray = option.stArray;
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
                        // const stBuffer = Cesium.Buffer.createVertexBuffer({
                        //     usage: Cesium.BufferUsage.STATIC_DRAW,
                        //     typedArray: new Float32Array(this.stArray),
                        //     context: frameState.context,
                        // });

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
                                // {
                                //     index: 1, // 等于 attributeLocations['position']
                                //     vertexBuffer: stBuffer,
                                //     componentsPerAttribute: 2,
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                // },
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
                                // textureCoordinates: new Cesium.GeometryAttribute({
                                //     componentDatatype: Cesium.ComponentDatatype.FLOAT,
                                //     componentsPerAttribute: 2,
                                //     values: this.stArray
                                // })
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
                            // textureCoordinates: 1,
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
                            // image: function() {
                            //     if (Cesium.defined(texture)) {
                            //         return texture;
                            //     } else {
                            //         return frameState.context.defaultTexture;
                            //     }
                            // }
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

                this.viewer.scene.globe.depthTestAgainstTerrain = true;
                let primitive = this.viewer.scene.primitives.add(
                    new DynamicSectorPrimitive({
                        modelMatrix: modelMatrix,
                        positionArray: option.typedArray,
                        stArray: option.stArray,
                        // time: option.time,
                        // normalsArray:normalsArray,
                    })
                );

                return primitive;
            }
            // 旋转 关键点，并保存 --- 关于旋转为什么不生效，明天再看看，实在不行就直接找点
            let rotateInClipSpace = () => {
                // 如何在 clip space 里 绕 Z轴 旋转？？？
                let rotateM = this.rotateAroundXAxis((-90 * (Math.PI/180)));// (30 * (Math.PI/180))
                rotateM = Cesium.Matrix4.multiply(Cesium.Matrix4.IDENTITY, rotateM, rotateM);
                let invRotateM = Cesium.Matrix4.inverse(rotateM, new Cesium.Matrix4());
                console.log('%c [ invRotateM ]-2598', 'font-size:13px; background:pink; color:#bf2c9f;', invRotateM)
                let start_R = this.Matrix4MultiplyByPoint(invRotateM, start);
                let end_R = this.Matrix4MultiplyByPoint(invRotateM, end);
                let referP1_R = this.Matrix4MultiplyByPoint(invRotateM, referP1);
                let referP2_R = this.Matrix4MultiplyByPoint(invRotateM, referP2);
                let points_R = BezierBy4Point(start_R, referP1_R, referP2_R, end_R, numOfPoints);// 100 means get 100 points on this Bezier Curve
                let arrangedPoints_R = [];
                for (let i = 1; i < numOfPoints - 1 - 1; i++){
                    arrangedPoints_R.push(...points_R[i-1])
                    arrangedPoints_R.push(...points_R[i])
                    arrangedPoints_R.push(...points_R[numOfPoints - 1])
                }
                // 乘上box的长度
                let boxVertex_R = arrangedPoints.map(function (v) {
                    return v * radius;
                });
                drawDynamicSector_R({
                    matrix:modelMatrix,
                    typedArray:boxVertex_R,
                    // stArray,
                    // normalsArray,
                    // time,
                    color:new Cesium.Color(1.0, 0.0, 0.0, 1.0),
                    alpha:0.8,
                })
            }



        },
        customRadarByCustomPrimitive() {
            var viewer = this.viewer;

            var boxLength = 100000.0;
            var position = Cesium.Cartesian3.fromDegrees( 116.39, 39.9, 0.5 * boxLength ); // Box 的质心
            // viewer.entities.add({
            //     position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 0.5 * boxLength),
            //     point: {
            //         pixelSize: 10,
            //         color: Cesium.Color.YELLOW,
            //     },
            // });

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
                0, 1, 2,
                0, 2, 3,
                4, 5, 6,
                4, 6, 7,
                8, 9, 10,
                8, 10, 11,
                12, 13, 14,
                12, 14, 15,
                16, 17, 18,
                16, 18, 19,
                20, 21, 22,
                20, 22, 23,
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

            // showAxis(myBox, viewer.scene, 100000);

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
            myBox.appearance.material = colorMaterial;
        },
        // 如果使用的话，生成的雷达中间下凹的部分依然是没有一个顺畅的过渡，所以不适用于当前的场景
        customRadarByEllipsoidPrimitive() {
            // var viewer = this.viewer;
            var scene = this.viewer.scene;
            var primitives = scene.primitives;
            var solidWhite = Cesium.ColorGeometryInstanceAttribute.fromColor( Cesium.Color.WHITE );

            // Create box and ellipsoid boxes, and use the instance's
            // modelMatrix to scale and position them.
            var radii = new Cesium.Cartesian3(0.5, 0.5, 1.0);
            var ellipsoidGeometry = new Cesium.EllipsoidGeometry({
                vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                radii: radii,
                stackPartitions:3,
                minimumClock: 0.0,
                maximumClock: Math.PI * 2,
                minimumCone:Math.PI * 2/3,
                maximumCone:Math.PI,
            });
            var ellipsoidOutlineGeometry = new Cesium.EllipsoidOutlineGeometry({
                radii: radii,
                stackPartitions: 6,
                slicePartitions: 5,
            });
            var radius = 0.75;
            var sphereGeometry = new Cesium.SphereGeometry({
                vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
                radius: radius,
                stackPartitions: 4,

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
            var height = 0;
            // for (i = 0; i < 5; ++i) {
                // height = 100000.0 + 200000.0 * i;
                height = 100000.0;
                ellipsoidModelMatrix = Cesium.Matrix4.multiplyByUniformScale(
                    Cesium.Matrix4.multiplyByTranslation(
                        Cesium.Transforms.eastNorthUpToFixedFrame( Cesium.Cartesian3.fromDegrees(-102.0, 45.0) ),
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
            // }
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
            // myBox.appearance.material = colorMaterial;


            this.viewer.camera.flyTo({
                destination:Cesium.Cartesian3.fromDegrees(-102.0, 45.0,100000),
            })
        },
        testForDrawACircleByBezier4Point() {
            let height = 10000;
            let centerLon = 1.0;
            let centerLat = 10.0;
            let gap = 2.0;
            let a = new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat, height);
            let b = new Cesium.Cartesian3.fromDegrees(centerLon, centerLat + gap, height);
            let c = new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat, height);
            let d = new Cesium.Cartesian3.fromDegrees(centerLon, centerLat - gap, height);

            let getPoints = (p1,p2,p3,p4,num) => {
                // console.log('p1 ', p1,'p2 ', p2,'p3 ', p3,'p4 ', p4)
                // console.log('num', num)
                let points = BezierBy4Point(p1, p2, p3, p4, num);// 100 means get 100 points on this Bezier Curve
                return points;
                // console.log('%c [ points ]-1922', 'font-size:13px; background:pink; color:#bf2c9f;', points)
                // let arrangedPoints = [];
                // for (let i = 0; i < num - 1; i++){
                //     // arrangedPoints.push(...points[i-1])
                //     arrangedPoints.push(...points[i])
                //     // arrangedPoints.push(...points[numOfPoints - 1])
                // }
                // // 乘上box的长度
                // let boxVertex = arrangedPoints.map(function (v) {
                //     return v * radius * 2;
                // });
                // return boxVertex;
            };

            // a,b
            let points1 = getPoints( a, new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat + gap/2, height), new Cesium.Cartesian3.fromDegrees(centerLon - gap/2, centerLat + gap, height), b, 10 )
            // b,c
            let points2 = getPoints( b, new Cesium.Cartesian3.fromDegrees(centerLon - gap/2, centerLat + gap, height), new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat + gap/2, height), c, 10 )
            // c,d
            let points3 = getPoints( c, new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat - gap/2, height), new Cesium.Cartesian3.fromDegrees(centerLon - gap/2, centerLat - gap, height), d, 10 )
            // d,a
            let points4 = getPoints( d, new Cesium.Cartesian3.fromDegrees(centerLon - gap/2, centerLat - gap, height), new Cesium.Cartesian3.fromDegrees(centerLon - gap, centerLat - gap/2, height), a, 10 )

            let points = [...points1, ...points2, ...points3, ...points4];
            console.log('%c [ points ]-3542', 'font-size:13px; background:pink; color:#bf2c9f;', points)
            // points.forEach()
            // this.ForTest.addPoint()
            this.ForTest.addPolyline(points)
        },


        Matrix4MultiplyByPoint(matrix,p) {
            console.log('%c [ p ]-2623', 'font-size:13px; background:pink; color:#bf2c9f;', p)
            var vX = p[0];
            var vY = p[1];
            var vZ = p[2];
            var x = matrix[0] * vX + matrix[4] * vY + matrix[8] * vZ + matrix[12];
            var y = matrix[1] * vX + matrix[5] * vY + matrix[9] * vZ + matrix[13];
            var z = matrix[2] * vX + matrix[6] * vY + matrix[10] * vZ + matrix[14];
            console.log('x', x, 'y', y, 'z', z)

            // var vec = [...p, 0];


            return [x, y, z];
        },

        rotateAroundZAxis(a) {
            return [
                Math.cos(a), -Math.sin(a),    0,    0,
                Math.sin(a),  Math.cos(a),    0,    0,
                0,       0,    1,    0,
                0,       0,    0,    1
            ];
        },
        rotateAroundXAxis(a) {
            return [
                1,       0,        0,     0,
                0,  Math.cos(a),  -Math.sin(a),     0,
                0,  Math.sin(a),   Math.cos(a),     0,
                0,       0,        0,     1
            ];
        },
        rotateAroundYAxis(a) {
            return [
                Math.cos(a),   0, Math.sin(a),   0,
                0,   1,      0,   0,
                -Math.sin(a),   0, Math.cos(a),   0,
                0,   0,      0,   1
            ];
        },


        getSumDistanceByCartesianDistance(positions) {
            // 算出每相邻的2个点的距离，然后加起来
            let distance = 0;
            for (let i = 0; i < positions.length - 1; i++){
                distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
            }
            // console.log("distance2", distance);
            return distance;
        },
        // for test
        createPoint(pos, color=Cesium.Color.YELLOW,size=10){
            let point = this.viewer.entities.add({
                position: pos,
                point: {
                    pixelSize: size,
                    color: color,
                },
            });
            return point;
        },
        createPolyline(pos=Cesium.Cartesian3.fromDegreesArray([-75, 35, -125, 35]), color=Cesium.Color.YELLOW,width=5){
            const polyline = viewer.entities.add({
                polyline: {
                    positions: pos,
                    width: width,
                    arcType: Cesium.ArcType.RHUMB,
                    material: color,
                },
            });
            return polyline;
        },
    },

    beforeDestroy() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
div#cesiumContainer {
    height: 100vh;
    width: 100vw;
}
</style>
