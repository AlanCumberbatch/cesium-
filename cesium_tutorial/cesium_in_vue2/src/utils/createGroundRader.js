import * as Cesium from "cesium";


// function createRadarByElliposid(viewer, option) {
function createGroundRader(viewer, option = {}) {
    if (!viewer) {
        alert("createRadar 必须传入 viewer");
        return;
    }
    console.log("option",option)
    // console.log("this.innerRadius", this.innerRadius);
    /*
        option:{
            angleOfHollow: Number  0 < number < 90
            radius:  Number  0 < number < 90
            position: Cartesian3
            zoomTo:Boolean  是否将相机对准生成的 雷达模型，默认为true
        }
     */
    console.log("start create Ground Radar")
    this.position = option.position ? option.position : Cesium.Cartesian3.fromDegrees(-80, 35);
    this.ifZoomTo = option.zoomTo ? option.zoomTo : false;
    // this.angleOfHollow = option.angleOfHollow ? option.angleOfHollow : 40.0; //中间窟窿的圆心角度
    this.angleOfHollow = option.pitchAngleRange ? option.pitchAngleRange : 40.0; //中间窟窿的圆心角度
    this.angleOfSector = 90.0 - this.angleOfHollow; // 扇形的圆心角度
    // this.angleOfSector = option.pitchAngleRange ? 90 - option.pitchAngleRange : 50.0 ; // 扇形的圆心角度 --- 即： 雷达的 俯仰角度
    this.radius = option.radius ? option.radius : 200000.0; //球体半径/扇形侧边距/雷达扫描半径
    this.innerRadius = 90.0; //根据目前的验证，不会有什么影响 --- "cesium": "^1.86.1",

    this.name = option.name ? option.name : 'a line';

    this.viewer = viewer;

    // 带 空心 的半球体
    this.radar = this.viewer.entities.add({
        name: name,
        position: this.position,
        ellipsoid: {
            radii: new Cesium.Cartesian3(this.radius, this.radius, this.radius), // 扇形半径
            innerRadii: new Cesium.Cartesian3( this.innerRadius, this.innerRadius, this.innerRadius ), //内半径
            minimumCone: Cesium.Math.toRadians(this.angleOfSector),
            maximumCone: Cesium.Math.PI_OVER_TWO,
            material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
            outline: option.outline ? option.outline : false,
        },
    });

    // 扇形
    // this.heading = 0.0;
    let heading = 0.0;
    let that_ = this;
    this.sector = this.viewer.entities.add({
        name: `sector of ${name}`,
        position: this.position,
        orientation: new Cesium.CallbackProperty(function (time, result) {
            heading += 4.0;
            return Cesium.Transforms.headingPitchRollQuaternion(
                that_.position,
                new Cesium.HeadingPitchRoll((heading * Math.PI) / 180, 0.0, 0.0)
            );
        },false),
        ellipsoid: {
            radii: new Cesium.Cartesian3(this.radius, this.radius, this.radius),
            innerRadii: new Cesium.Cartesian3(
                this.innerRadius,
                this.innerRadius,
                this.innerRadius
            ),
            minimumCone: Cesium.Math.toRadians(this.angleOfSector),
            maximumCone: Cesium.Math.PI_OVER_TWO,
            // material: Cesium.Color.RED.withAlpha(0.1),
            material: option.color ? getColor(option.color,option.alpha ? option.alpha : 0.1) : Cesium.Color.RED.withAlpha(0.1),
            minimumClock: Cesium.Math.toRadians(0),
            maximumClock: Cesium.Math.toRadians(0.1),
        },
    });

    this.showOrNot = function (showOrNot) {
        that_.radar.show = showOrNot;
        that_.sector.show = showOrNot;
    }


    if (this.ifZoomTo) {
        this.viewer.zoomTo(this.viewer.entities);
    }
}

function getColor(colorName, alpha) {
    const color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}



export default createGroundRader;
