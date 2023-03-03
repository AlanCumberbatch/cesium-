import * as Cesium from 'cesium'

/*
    Entity:
        let Matrix = entityModel.computeModelMatrix(Cesium.JulianDate.now())
        showAxis({modelMatrix: Matrix},viewer.scene);
    Primitive:
        showAxios(primitive, scene);

    change the position of  modelMatrixPrimitive:
        give the new model Matrix to modelMatrixPrimitive
*/
function showAxis(primitive, scene,length=10000) {
    if (!primitive.modelMatrix) { alert('必须传入 modelMatrix'); return; }
    const modelMatrix = primitive.modelMatrix;

    let modelMatrixPrimitive = new Cesium.DebugModelMatrixPrimitive({ modelMatrix: modelMatrix });
    modelMatrixPrimitive.length = length;// default 10000000

    scene.primitives.add(modelMatrixPrimitive);

    return modelMatrixPrimitive;
}

export default showAxis