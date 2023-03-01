import { getSiteTimes, courseAngle, coursePitchAngle,} from "@/utils/cesiumjs/cesiumUtils";
function createfly(positions) {
    let viewer = this.viewer;
    let siteobj = getSiteTimes(positions, 1);
    var start = Cesium.JulianDate.fromDate(new Date());
    var stop = Cesium.JulianDate.addSeconds(
        start,
        siteobj.timeSum,//时间数组
        // 100000,
        new Cesium.JulianDate()
    );
    //Make sure viewer is at the desired time.
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 10;
    viewer.timeline.zoomTo(start, stop);
    //设置进攻路径
    let startp = Cesium.Cartesian3.fromDegrees(
      120.709006,
      22.752524,
      48603.6642
    );
    let endp = Cesium.Cartesian3.fromDegrees(
      121.094252,
      23.457862,
      36909.212
    );
    // let positions = generateCurve(startp,endp)

    // 飞机初始姿态
    // var ori = changeEntityMat(-60,-60,200,[positions[0].x,positions[0].y])
    // 位置信息的property
    var pathPosition = new Cesium.SampledPositionProperty();
    // 姿态property
    var oriProp = new Cesium.SampledProperty(Cesium.Quaternion);
    // var oriProp= new Cesium.TimeIntervalCollectionProperty()

    var entityPath = viewer.entities.add({
        id: "plane" + positions[0].x,
        position: pathPosition,
        name: "path",
        path: {
            show: true,
            leadTime: 0,
            trailTime: 60,
            width: 10,
            resolution: 1,
            material:
            // new PolylineTrailLinkMaterialProperty(
            //     Cesium.Color.BLUE,
            //     5000,
            //     flowMater
            // )
            new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.3,
                taperPower: 0.3,
                color: Cesium.Color.PALEGOLDENROD,
            }),
        },
        model: {
            uri: "./model/Cesium_Air.glb",
            minimumPixelSize: 64,
            // maximumScale: 200,
            // color:Cesium.Color.NAVY,
            // scale:0.3,
        },
        orientation: oriProp,
    });
    // 设置SampledPositionProperty和SampledProperty
    positions.forEach((item, i) => {
        var time = Cesium.JulianDate.addSeconds( start, i * 5, new Cesium.JulianDate() );
        var timenext = Cesium.JulianDate.addSeconds( start, (i + 1) * 5, new Cesium.JulianDate() );
        pathPosition.addSample(time, item);

        // 设置姿态
        // 将世界坐标转为经纬度
        let ellise = viewer.scene.globe.ellipsoid;
        let lngnext, latnext, altnext = {};
        let lng = Cesium.Math.toDegrees( ellise.cartesianToCartographic(item).longitude );
        let lat = Cesium.Math.toDegrees( ellise.cartesianToCartographic(item).latitude );
        let alt = ellise.cartesianToCartographic(item).height;
        if (i + 1 < positions.length) {
            lngnext = Cesium.Math.toDegrees( ellise.cartesianToCartographic(positions[i + 1]).longitude );
            latnext = Cesium.Math.toDegrees( ellise.cartesianToCartographic(positions[i + 1]).latitude );
            altnext = ellise.cartesianToCartographic(positions[i + 1]).height;
        }
        // 初始姿态
        if (i === 0) {
            // let headangle = computeHeading(lat,lng,latnext,lngnext)
            let heada = courseAngle(lng, lat, lngnext, latnext);
            let pitch = coursePitchAngle( lng, lat, alt, lngnext, latnext, altnext );

            var hpr = new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(0 - heada),
                Cesium.Math.toRadians(pitch),
                Cesium.Math.toRadians(0)
            );
            var qua = Cesium.Transforms.headingPitchRollQuaternion(item, hpr);
            oriProp.addSample(time, qua);
            // oriProp.intervals.addInterval( new Cesium.TimeInterval({
            //     start : time,
            //     stop : timenext,
            //     isStartIncluded : true,
            //     isStopIncluded : false,
            //     data : qua
            // }))
        } else if (i  > 0 && i  < positions.length-1) {
        // 更新位置

        let heada1 = courseAngle(lng, lat, lngnext, latnext);
        let pitch1 = coursePitchAngle( lng, lat, alt, lngnext, latnext, altnext );

        var hpr = new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(0 - heada1),
            Cesium.Math.toRadians(pitch1),
            Cesium.Math.toRadians(0)
        );
        // var transform = Cesium.Transforms.headingPitchRollToFixedFrame(item, hpr);
        var qua = Cesium.Transforms.headingPitchRollQuaternion(item, hpr);
        oriProp.addSample(time, qua);
        // oriProp.intervals.addInterval( new Cesium.TimeInterval({
        //     start : time,
        //     stop : timenext,
        //     isStartIncluded : true,
        //     isStopIncluded : false,
        //     data : qua
        // }))
        }
    });
}
function interpolatLine(positions, num) {
    let time = [];
    for (let i = 0; i < num - 1; i++) {
      let t1 = Math.round((1 / (num - 1)) * 100) / 100;
      time.push(t1 * i);
    }
    time.push(1.0);
    var spline = new Cesium.CatmullRomSpline({
      times: time, //[0.0, 0.2, 0.4, 0.64,0.8,1],
      points: positions,
    });
    var RES = [];
    for (var i = 0; i <= 260; i++) {
      var cartesian3 = spline.evaluate(i / 260);
      RES.push(cartesian3);
    }
    return RES;
}
