import * as Cesium from 'cesium'

//让相机不能进入地球内部
function preventCameraIntoUnderground(viewer) {
    var minPitch = -Cesium.Math.PI_OVER_TWO
    var maxPitch = 0
    var minHeight = 200
    viewer.camera.changed.addEventListener(
     function() {
         if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
             viewer.camera._suspendTerrainAdjustment = false
             viewer.camera._adjustHeightForTerrain()
         }
         // Keep camera in a reasonable pitch range
         var pitch = viewer.camera.pitch;
         if (pitch > maxPitch || pitch < minPitch) {
             viewer.scene.screenSpaceCameraController.enableTilt = false;
             // clamp the pitch
             if (pitch > maxPitch) {
                 pitch = maxPitch
             } else if (pitch < minPitch) {
                 pitch = minPitch
             }
             var destination = Cesium.Cartesian3.fromRadians(
                 viewer.camera.positionCartographic.longitude,
                 viewer.camera.positionCartographic.latitude,
                 Math.max(viewer.camera.positionCartographic.height, minHeight)
             )

             viewer.camera.setView({
                 destination: destination,
                 orientation: { pitch: pitch }
             })

             viewer.scene.screenSpaceCameraController.enableTilt = true;
         }
     }
    )
}

export default preventCameraIntoUnderground