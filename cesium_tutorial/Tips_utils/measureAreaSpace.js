//[reference link](http://www.javashuo.com/article/p-bvilnxnr-gn.html)
/*
  空间面积测量对象是平面，考虑到了取点的高度；
  地表面积测量的是球体（地球）曲面

  个人关于代码的理解：
    1. 通过鼠标点击事件，收集多边形的顶点信息
    2. 然后根据顶点的经纬度以及height 进行面积计算 // 暗合 osg的将图元拆分成多个三角形的计算方式
    //！ 关于具体如何计算，还请哪位大佬指教🙏🙏🙏
*/
//****************************测量空间面积************************************************//
var measureAreaSpace = function (viewer, handler) {
    handler = new Cesium.ScreenSpaceEventHandler(
        viewer.scene._imageryLayerCollection
    ); //_imageryLayerCollection 这个里面存的是什么？？？？
    var positions = [];
    var tempPoints = [];
    var polygon = null;
    var tooltip = document.getElementById("toolTip");
    var cartesian = null;
    var floatingPoint; //浮动点
    tooltip.style.display = "block";

    handler.setInputAction(function (movement) {
        tooltip.style.left = movement.endPosition.x + 3 + "px";
        tooltip.style.top = movement.endPosition.y - 25 + "px";
        tooltip.innerHTML = "<p>单击开始，右击结束</p>";
        cartesian = viewer.scene.pickPosition(movement.endPosition);
        //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if (positions.length >= 2) {
            if (!Cesium.defined(polygon)) {
                polygon = new PolygonPrimitive(positions);
            } else {
                positions.pop();
                // cartesian.y += (1 + Math.random());
                positions.push(cartesian);
            }
            // tooltip.innerHTML='<p>'+distance+'米</p>';
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (movement) {
        tooltip.style.display = "none";
        cartesian = viewer.scene.pickPosition(movement.position);
        // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if (positions.length == 0) {
            positions.push(cartesian.clone());
        }
        //positions.pop();
        positions.push(cartesian);
        //在三维场景中添加点：为了标记鼠标点击的位置，即要计算面积的多边形的顶点 ---》
        var cartographic = Cesium.Cartographic.fromCartesian(
            positions[positions.length - 1]
        );
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = cartographic.height;
        tempPoints.push({
            lon: longitudeString,
            lat: latitudeString,
            hei: heightString,
        });
        floatingPoint = viewer.entities.add({
            name: "多边形面积",
            position: positions[positions.length - 1],
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.none,
            },
        });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction(function (movement) {
        handler.destroy();
        positions.pop();
        //tempPoints.pop();
        viewer_g.entities.remove(floatingPoint);
        tooltip.style.display = "none";
        //在三维场景中添加点
        // var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        // var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        // var heightString = cartographic.height;
        // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});

        var textArea = getArea(tempPoints) + "平方千米";
        viewer.entities.add({
            name: "多边形面积",
            position: positions[positions.length - 1],
            // point : {
            // 	pixelSize : 5,
            // 	color : Cesium.Color.RED,
            // 	outlineColor : Cesium.Color.WHITE,
            // 	outlineWidth : 2,
            // 	heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
            // },
            label: {
                text: textArea,
                font: "18px sans-serif",
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(20, -40),
            },
        });
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
    var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

    //计算多边形面积
    function getArea(points) {
        var res = 0;

        //拆分三角曲面 --
        for (var i = 0; i < points.length - 2; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            var totalAngle = Angle(points[i], points[j], points[k]); //

            var dis_temp1 = distance(positions[j], positions[0]);
            var dis_temp2 = distance(positions[k], positions[0]);
            res += (dis_temp1 * dis_temp2 * Math.sin(totalAngle)) / 2;
            // console.log(res);
        }

        return Math.abs((res / 1000000.0).toFixed(4));
    }

    /*角度*/
    function Angle(p1, p2, p3) {
        var bearing21 = Bearing(p2, p1);
        var bearing23 = Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    function Bearing(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        // Math.atan2() 返回从原点(0,0)到(x,y)点的线段与x轴正方向之间的平面角度(弧度值)，也就是Math.atan2(y,x)
        // 这里用的什么知识 ？？？？
        var angle = -Math.atan2(
            Math.sin(lon1 - lon2) * Math.cos(lat2),
            Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
        );
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian; //角度
        return angle;
    }

    var PolygonPrimitive = (function () {
        function _(positions) {
            this.options = {
                name: "多边形",
                polygon: {
                    hierarchy: [],
                    perPositionHeight: true,
                    material: Cesium.Color.GREEN.withAlpha(0.5),
                },
            };

            this.hierarchy = positions;
            this._init();
        }

        _.prototype._init = function () {
            var _self = this;
            var _update = function () {
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(
                _update,
                false
            );
            viewer.entities.add(this.options);
        };

        return _;
    })();

    function distance(point1, point2) {
        var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(
            Math.pow(s, 2) +
                Math.pow(
                    point2cartographic.height - point1cartographic.height,
                    2
                )
        );
        return s;
    }
};
