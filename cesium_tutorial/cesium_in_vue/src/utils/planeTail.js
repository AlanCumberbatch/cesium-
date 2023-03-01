import * as Cesium from "cesium";

function addPrimitiveFlowAppear(pos) {
    var primitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: pos,
                width: 5,
                vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT, //可以不设置，一般会根据 appearance的类型自动默认对应的类型
            }),
            attributes: {
                //color : Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 1.0, 1.0))
            },
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
            material: Cesium.Material.fromType(Cesium.Material.FadeType, {
                repeat: true,
                fadeInColor: Cesium.Color.YELLOW.withAlpha(0), // 这里更改颜色是OK的
                fadeOutColor: Cesium.Color.WHITE,
                time: new Cesium.Cartesian2(0.0, 0.0),
                fadeDirection: {
                    x: true,
                    y: false,
                },
            }),
        }),
    });
    return primitive;
}
function createTailByFadeType(viewer, position) {
    //这里面的 position 只能是 Cartesian3
    // if (!(position instanceof Cesium.Cartesian3)) { alert('传入 createTailByFadeType 的 position 只能是 Cartesian3'); return; }
    // 通过设置 Cesium.Material.FadeType 实现流动的线
    let positions = Cesium.Cartesian3.fromDegreesArray([-75, 37, -125, 37]);
    let primi = addPrimitiveFlowAppear(positions);
    viewer.scene.primitives.add(primi);

    var timex = 0;
    function render() {
        timex += 0.01;
        if (timex >= 1.0) {
            timex = 0; // 控制在0.0到1.0之间
        }
        primi.appearance.material.uniforms.time.x = timex;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    return primi;
}

export default { createTailByFadeType };
