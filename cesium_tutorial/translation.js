// translation/平移 思路
// 获取当前瓦片数据集的包裹范围（boundingSphere）中心（此时参考系是世界坐标）
// 计算：当参考系是局部坐标(此位置为原点的局部坐标系)时，到世界坐标的转换矩阵（eastNorthUpToFixedFrame）
// 利用上一步的转换矩阵，左乘一个局部平移向量，得到此平移向量在世界坐标系下的平移目标位置（矩阵×向量，结果是向量）
// 向量相减：世界坐标系下，指向平移目标点位的目标向量 - 指向数据集中心的向量，得到世界坐标系下的平移向量。
// 将世界坐标系下的平移向量转换成平移矩阵，赋予 tileset.modelMatrix

let tileset = {};// 使用Cesium引入3DTiles的那个方法得到的变量
tileset.readyPromise.then((tileset) => {
    const tileset_center = tileset.boundingSphere.center; // Cartesian3
    const frompoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(tileset_center); // Matrix4: 当前点为原点的局部坐标系到世界坐标系的转换矩阵
    const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米---//TODO ? 单位确定是 米 吗？
    const result = new Cesium.Cartesian3(0, 0, 0);
    Cesium.Matrix4.multiplyByPoint(
        frompoint_to_world_matrix,
        local_translation,
        result
    ); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
    const targetpoint_to_world_matrix = Cesium.Transforms.eastNorthUpToFixedFrame(result);

    const world_translation = new Cesium.Cartesian3(
        targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
        targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
        targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14]
    ); // 向量相减，得到世界坐标下的平移向量

    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值
    viewer.zoomTo(tileset);
});
