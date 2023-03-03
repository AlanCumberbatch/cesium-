import {maps, projectParams, useMapTypeData} from "@/package/csBaseMap/service/csBaseMapImp";
import {useDrawEntityImp} from "@/package/csBaseMap/service/drawEntitImp";
import {useCesiumUtils} from "@/package/csBaseMap/service/cesiumUtils";
import {shallowReactive} from "vue";

//自定义巡航
export const useCameraPatrolImp=()=>{
    const { setMapParams } = useMapTypeData();//地图配置的参数，2d和3d需要不同的参数
    const { drawPolyLine}=useDrawEntityImp();
    const {getCartesian3ByJwh}=useCesiumUtils();
    //计算距离
    let PI = 3.1415926;
    const getDistance=( lat1, lng1, lat2, lng2)=>{
        let EarthRadius = 6378137;
        let Rad = PI / 180.0;
        let radlat1 = lat1 * Rad;
        let radlat2 = lat2 * Rad;
        let a = radlat1 - radlat2;
        let b = (lng1 - lng2)*Rad;
        let s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2)+Math.cos(radlat1)*Math.cos(radlat2)*Math.pow(Math.sin(b/2),2)));
        s = s*EarthRadius;
        s = Math.round(s * 100) / 100;
        return s;
    }

    //计算角度

    const getAngle=( lat1, lng1, lat2, lng2)=>{
        let x = Math.sin(lng2 - lng1) * Math.cos(lat2);
        let y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
        let angle = Math.atan2(x,y) * 180 / PI;
        return angle>0?angle:angle+360;
    }
    //计算heading
    function getHeading(pointA, pointB){
        pointA=getCartesian3ByJwh(pointA);//根据A点笛卡尔3坐标系计算出经纬高
        pointB=getCartesian3ByJwh(pointB);//根据B点笛卡尔3坐标系计算出经纬高
        //建立以点A为原点，X轴为east,Y轴为north,Z轴朝上的坐标系
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(pointA);
        //向量AB
        const positionvector = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
        //因transform是将A为原点的eastNorthUp坐标系中的点转换到世界坐标系的矩阵
        //AB为世界坐标中的向量
        //因此将AB向量转换为A原点坐标系中的向量，需乘以transform的逆矩阵。
        const vector = Cesium.Matrix4.multiplyByPointAsVector(Cesium.Matrix4.inverse(transform, new Cesium.Matrix4()), positionvector, new Cesium.Cartesian3());
        //归一化
        const direction = Cesium.Cartesian3.normalize(vector, new Cesium.Cartesian3());
        //heading
        const heading = Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO;
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(heading);
    }
    let time=null;
    let flyTime=null;
    let showLineEntity;
    const cameraPatrol=({start=true,showLine=true,patrol=[],carmeH=2500,speed=1300,color="#00ff064d"})=>{
        if(time){
            clearInterval(time);
            time=null;
        }
        if(flyTime){
            clearInterval(flyTime);
            flyTime=null;
        }
        if(start){
            maps.entities.removeById("xunhangLine");
            console.log("开始漫游");
            setMapParams('manyou');
            let arr=[]=patrol.map((i,j)=>{
                return i.jwh;
            })
            if(showLine==true){
                arr[arr.length]=arr[0];
                showLineEntity=drawPolyLine({jwh:arr.flat(1),id:"xunhangLine",color:color,wid:3,clampToGround:false});
            }
            let idx=0;
            let br=true;
            time=setInterval(()=>{
                if(br){
                    br=false;
                    if(patrol[idx]){
                        let duration=5;
                        let jw=arr[idx];
                        let nextJw=arr[idx+1];
                        let distance=getDistance(jw[0],jw[1],nextJw[0],nextJw[1]);
                        duration=Math.ceil(parseFloat((distance/speed).toPrecision(2)));
                        let heading=Cesium.Math.toDegrees(maps.scene.camera.heading);
                        if(nextJw){
                            heading=Cesium.Math.toDegrees(getHeading(jw,nextJw));
                        }
                        maps.scene.camera.flyTo({
                            duration:0.5,
                            //设置摄像头初始的具体位置(经度，纬度，高度)
                            destination:Cesium.Cartesian3.fromDegrees(...[jw[0],jw[1],carmeH]),
                            orientation: {
                                heading : Cesium.Math.toRadians(heading),
                                pitch : Cesium.Math.toRadians(-15),
                                roll : 0
                            }
                        })
                        flyTime=setTimeout(()=>{
                             maps.scene.camera.flyTo({
                                duration:duration,
                                destination :Cesium.Cartesian3.fromDegrees(...[nextJw[0],nextJw[1],carmeH]),
                                orientation: {
                                    heading : Cesium.Math.toRadians(heading),
                                    pitch : Cesium.Math.toRadians(-15),
                                    roll : 0.0
                                },
                                easingFunction:time=>time,
                                complete:()=>{
                                    if(arr[idx+2]){
                                        idx++;
                                        console.log("继续")
                                        br=true;
                                    }else {
                                        console.log("结束");
                                        idx=0;
                                        br=true;
                                    }
                                }
                            });
                        },800)
                    }else {
                        console.log("结束");
                        clearInterval(time);
                        br=false;
                    }
                }
            },1000)
        }else {
            maps.entities.removeById("xunhangLine");
            console.log("停止漫游");
            setMapParams();

        }
    }
    return{
        getAngle,
        cameraPatrol
    }
}
//绕点巡航
export const useRotateImp=()=>{
    let data=shallowReactive({
        pix:0,
        center:[108.959122, 34.219873],
        range:20000.0,
        pitch:Cesium.Math.toRadians(-35)
    })
    //顶点环绕调用
    const centRotateEvent=(e)=>{
        data.pix -= 0.3;//旋转速度
        if (data.pix < -179) {
            data.pix = 180
        }
        let center = Cesium.Cartesian3.fromDegrees(...data.center);
        let heading = Cesium.Math.toRadians(data.pix);
        let range = data.range;
        let pitch=data.pitch;
        maps.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
        // 取消视角锁定
        maps.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
    const centRotateFun=(bool)=>{
        if(bool){
            maps.scene.postRender.addEventListener(centRotateEvent);
        }else {
            maps.scene.postRender.removeEventListener(centRotateEvent);
        }
    }
    const initRotateConf=({center,pitch,range,pix})=>{
        data.center=center;
        if(pitch){
            data.pitch=Cesium.Math.toRadians(-pitch);
        }
        if(range){
            data.range=range;
        }
        if(pix){
            data.pix=pix;
        }
    }
    return{
        initRotateConf,
        centRotateFun,
    }
}
