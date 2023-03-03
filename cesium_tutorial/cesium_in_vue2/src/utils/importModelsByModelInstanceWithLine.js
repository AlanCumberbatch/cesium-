
import * as Cesium from 'cesium'
import addLabel from "./addLabel.js"

function getInstances(numberOfModel,ifFlyToOption) {
    let positionForLables = [];
    let positionForModel = [];

    var count = numberOfModel;
    var spacing = 0.08; //0.0002;
    var instances = [];
    var centerLongitude = -75.61209431;
    var centerLatitude = 40.042530612;
    var height = 5000.0;
    var gridSize = Math.sqrt(count);
    for (var y = 0; y < gridSize; ++y) {
     for (var x = 0; x < gridSize; ++x) {
         var longitude = centerLongitude + spacing * (x - gridSize / 2);
         var latitude = centerLatitude + spacing * (y - gridSize / 2);
         var position = Cesium.Cartesian3.fromDegrees( longitude, latitude, height );
         positionForModel.push(position);

         var positionLable = Cesium.Cartesian3.fromDegrees( longitude + 0.03, latitude, height + 4000 );
         positionForLables.push(positionLable);

         // 动态改变俯仰
         var heading = 0.4; //Math.random()/2;
         var pitch = 0.0; //Math.random()/2;
         var roll = 0.0; //Math.random()/2;
         // var scale = (Math.random() + 1.0) / 2.0 * 100;
         var scale = 100.0;
         var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
             position,
             new Cesium.HeadingPitchRoll(heading, pitch, roll)
         );
         Cesium.Matrix4.multiplyByUniformScale(
             modelMatrix,
             scale,
             modelMatrix
         );
         instances.push({
             modelMatrix: modelMatrix,
         });
     }
    }
    if (ifFlyToOption.flyTo && ifFlyToOption.viewer) {
    ifFlyToOption.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
          centerLongitude,
          centerLatitude,
          height + 20000
      ),
    });
    }
    return { instances, positionForLables, positionForModel };
}

function importModelsByModelInstanceWithLine(viewer, option) {
    if (!viewer) { alert('importModelsByModelInstanceWithLine 必须传入 viewer'); return; }
    /*
    option:{
    numberOfModel:Number  需要的模型数量，
    modelUri:String       想要展示的模型
    flyTo:Boolean         是否将相机对准展示的模型，默认为true
    }
    */
    let modelUri = option.modelUri ? option.modelUri : "./models/A380/A380.gltf";
    let numberOfModel = option.numberOfModel ? option.numberOfModel : 4;
    let flyTo = option.flyTo ? option.flyTo : true;

    // reference link : https://community.cesium.com/t/what-is-the-best-way-to-update-1000-entity-positon-10times-per-second/15992/5
    let { instances, positionForLables, positionForModel } = getInstances(numberOfModel,{flyTo:flyTo,viewer:viewer});
    let instanceCollection = new Cesium.ModelInstanceCollection({
        url: modelUri,
        instances: instances,
        // lightColor: Cesium.Color.RED.withAlpha(0.1),// colors,//
    });
    console.log("instanceCollection", instanceCollection);
    console.log("instanceCollection._boundingSphere", instanceCollection._boundingSphere);
    console.log("instanceCollection._boundingSphere.radius", instanceCollection._boundingSphere.radius);
    viewer.scene.primitives.add(instanceCollection);

    const labels = viewer.scene.primitives.add(
        new Cesium.LabelCollection()
    );
    for (let i = 0; i < positionForLables.length; i++) {
        // addLabel( viewer,positionForModel[i],instanceCollection._boundingSphere.radius);// 这里可以用了，但是Entity 的 model 不能获取 boudingSphere
        addLabel(viewer, positionForModel[i], {position: positionForLables[i],text:'123'});//
    }

     // let animateCars_in_preRender_notOK = () => {
     //  for (let i = 0; i < positionForLables.length; i++) {
     //   // position : Cesium.Cartesian3.fromDegrees(Cesium.Math.toRadians(pos.x),Cesium.Math.toRadians(pos.y),pos.z+11000),
     //       // labels.add({
     //       //     position : positionForLables[i],
     //       //     text : `Lable_1`,
     //       //     font : '24px Helvetica',
     //       // });
     //       createSingleLableLikePC(positionForLables[i],positionForModel[i]);
     //      // 我想怎么写？
     //      // 想通过矩阵，以及飞机的初始位置，算出飞机新的位置，然后进行label的添加
     //  }
     // };
     // viewer.scene.preRender.addEventListener(animateCars);
}

export default importModelsByModelInstanceWithLine