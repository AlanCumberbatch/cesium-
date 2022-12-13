// import Cesium from '../../Cesium'

class CesiumRenderPass {
 constructor(options:{
  name: string
  vertexShader?: string
  fragmentShader?: string
  shaderRedefine?: 'add' | 'replace'
  renderType?: 'all' | 'selected' | 'unselected'
  uniforms?: { [key: string]: any | (() => any) }
  beforeUpdate?(scene: Cesium.Scene): void
  renderStateProcess?(renderState?: Cesium.RenderState): void
 })
 readonly texture: Cesium.Texture
 readonly depthTexture: Cesium.Texture
 stage: Cesium.PostProcessStage
 clear(context: Cesium.Context): void
 update(context: Cesium.Context): void
}