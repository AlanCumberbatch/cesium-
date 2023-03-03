// import * as Cesium from 'cesium'
import { Transforms,Cartesian3,Matrix4 } from 'cesium'

function translatePointAlongAxis(pos,distances={x:0,y:500,z:0}) {
    //平移：
    const frompoint_to_world_matrix = Transforms.eastNorthUpToFixedFrame(pos); // Matrix4
    // const local_translation = new Cesium.Cartesian3(310, -140, 10); // 向模型中心为原点，正北为y，正东为x，地心朝上为z分别平移 310、-140、10米
    const local_translation = new Cartesian3(distances.x, distances.y, distances.z);
    const result = Matrix4.multiplyByPoint(frompoint_to_world_matrix, local_translation, new Cartesian3(0,0,0)); // 转换矩阵左乘局部平移向量，结果存储在 result 中，结果是世界坐标下的平移终点向量
    const targetpoint_to_world_matrix = Transforms.eastNorthUpToFixedFrame(result);

    const world_translation = new Cartesian3(
        targetpoint_to_world_matrix[12] - frompoint_to_world_matrix[12],
        targetpoint_to_world_matrix[13] - frompoint_to_world_matrix[13],
        targetpoint_to_world_matrix[14] - frompoint_to_world_matrix[14],
    ); // 向量相减，得到世界坐标下的平移向量

    // 最终的矩阵
    let transitionMatrix = Matrix4.fromTranslation(world_translation); // 构造平移矩阵并赋值

    let target_pos = Matrix4.multiplyByPoint( transitionMatrix, pos, new Cartesian3())

    return target_pos;
}

export default translatePointAlongAxis