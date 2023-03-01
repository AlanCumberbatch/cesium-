
import {HeadingPitchRoll,Transforms} from 'cesium'

function HPR2Orientation(position, heading, pitch,roll) {
  let hpr = new HeadingPitchRoll(heading, pitch, roll);// Cesium.Math.toRadians(heading), 必须是 弧度/ must in radian

  // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "north", "east" );
  // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "east", "north" );
  // const fixedFrameTransform = Cesium.Transforms.localFrameToFixedFrameGenerator( "west", "south" );

  // Cesium.Transforms.headingPitchRollQuaternion(origin, headingPitchRoll, ellipsoid, fixedFrameTransform, result)
  // let orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr,Cesium.Ellipsoid.WGS84,fixedFrameTransform);

  let orientation = Transforms.headingPitchRollQuaternion(position, hpr);

  //这种写法会报错，不知道为什么
  // var orientation = Cesium.Transforms.headingPitchRollQuaternion(drone.position, hpr);
  // drone.orientation = orientation;

  return orientation;
}

export default HPR2Orientation