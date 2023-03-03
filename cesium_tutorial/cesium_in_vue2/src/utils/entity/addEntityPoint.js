import { Color } from 'cesium'

function addEntityPoint(viewer,pos, color = Color.YELLOW, size = 10){
  let point = viewer.entities.add({
      position: pos,
      point: {
          pixelSize: size,
          color: color,
      },
  });
  return point;
}

export default addEntityPoint