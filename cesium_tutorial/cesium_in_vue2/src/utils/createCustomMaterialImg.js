import * as Cesium from 'cesium'

const defaultColor = Cesium.Color.WHITE;
const defaultGlowPower = 0.25;
const defaultTaperPower = 1.0;

function createCustomMaterial(options = {}) {
    let imgUrl = options.img ? options.img : "./imgs/colors.png";// 默认文件路径可以这么写的原因是： 相关 img 都被放到了 public 里
    let type = options.type ? options.type : 'PolylineTrailLink';// type的命名规则： polyline/polygon/图元名称 + 描述(根据具体特性)
    let imgName = `${type}Image`;// PolylineTrailLinkImage
    let shaderSource = `${type}Source`;// PolylineTrailLinkSource
    let materialTypeKey = `${type}Type`;// PolylineTrailLinkType
    let MaterialProperty = `${type}MaterialProperty`;// PolylineTrailLinkType

    let diffuse = options && options.diffuse ? options.diffuse : 2.0;
    // if (diffuse - (diffuse | 0) == 0) { diffuse = diffuse.toFixed(1) }//  diffuse | 0 : 是通过位运算的方式进行取整（超32个有效数位就不生效了，js最多53位）
    if (diffuse - Math.trunc(diffuse) == 0) { diffuse = diffuse.toFixed(1) }// es6 新增 获取整数的方法

    let animationSpeed = options && options.diffuse ? options.animationSpeed : 1.0;
    if (animationSpeed <= 0) {
        alert(`当前 animationSpeed 的值${animationSpeed} 小于 0, 不生效。必须大于0 !`);
        animationSpeed = 1.0;
    }

    function PolylineTrailLinkMaterialProperty(color, duration, d) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.duration = duration || 3000;
        this._time = (new Date()).getTime();
        this._d = d;
        this.isTranslucent = function () { return true; }

        this._glowPower = undefined;
        this._glowPowerSubscription = undefined;
        this._taperPower = undefined;
        this._taperPowerSubscription = undefined;

        this.color = color;
        this.glowPower = options.glowPower;
        this.taperPower = options.taperPower;
    }
    Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color'),
        /**
        * Gets or sets the numeric Property specifying the strength of the glow, as a percentage of the total line width (less than 1.0).
        * @memberof PolylineGlowMaterialProperty.prototype
        * @type {Property|undefined}
        */
        glowPower: Cesium.createPropertyDescriptor("glowPower"),

        /**
        * Gets or sets the numeric Property specifying the strength of the tapering effect, as a percentage of the total line length.  If 1.0 or higher, no taper effect is used.
        * @memberof PolylineGlowMaterialProperty.prototype
        * @type {Property|undefined}
        */
        taperPower: Cesium.createPropertyDescriptor("taperPower"),
    });

    PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
        return type; //'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
        result.glowPower = Cesium.Property.getValueOrDefault( this._glowPower, time, defaultGlowPower, result.glowPower );
        result.taperPower = Cesium.Property.getValueOrDefault( this._taperPower, time, defaultTaperPower, result.taperPower );

        result.image = Cesium.Material[imgName];
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration * this._d * animationSpeed;// 这个参数只影响 动态效果的变化的速率
        return result;
    }
    // PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
    //     return this === other || (other instanceof PolylineTrailLinkMaterialProperty && Property.equals(this._color, other._color))
    // }
    PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
        return (
            this === other ||
            (other instanceof PolylineGlowMaterialProperty &&
                Property.equals(this._color, other._color) &&
                Property.equals(this._glowPower, other._glowPower) &&
                Property.equals(this._taperPower, other._taperPower))
        );
    };

    Cesium[MaterialProperty] = PolylineTrailLinkMaterialProperty;
    Cesium.Material[materialTypeKey] = type; //'PolylineTrailLink';
    Cesium.Material[imgName] = imgUrl;

    let fragmentShader = ` czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                            {\n\
                                                                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                                vec2 st = materialInput.st;\n\
                                                                vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t ));\n\
                                                                material.alpha = colorImage.a * color.a;\n\
                                                                material.diffuse = (colorImage.rgb+color.rgb)/ ${diffuse} ;\n\
                                                                return material;\n\
                                                            }`;
    Cesium.Material[shaderSource] = options.fragmentShader ? options.fragmentShader : fragmentShader;

    let uniforms = options.uniforms ? options.uniforms : {
        color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
        image: Cesium.Material[imgName],
        time: -20
    };
    Cesium.Material._materialCache.addMaterial(Cesium.Material[materialTypeKey], {
        fabric: {
            type: Cesium.Material[materialTypeKey],
            uniforms: uniforms,
            source: Cesium.Material[shaderSource],
        },
        translucent: function (material) {
            return true;
        }
    });
    // Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
    //     fabric: {
    //         type: Cesium.Material.PolylineTrailLinkType,
    //         uniforms: {
    //             color: new Cesium.Color(0.0, 0.0, 1.0, 0.5),
    //             image: Cesium.Material.PolylineTrailLinkImage,
    //             time: -20
    //         },
    //         source: Cesium.Material.PolylineTrailLinkSource
    //     },
    //     translucent: function (material) {
    //         return true;
    //     }
    // });

    return MaterialProperty;
}

export default createCustomMaterial