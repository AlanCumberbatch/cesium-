#### Plane：
- Vertex：
var v0 = [0.5, 0.5, 0];
var v1 = [0.5, -0.5, 0];
var v2 = [-0.5, -0.5, 0];
var v3 = [-0.5, 0.5, 0];
var rawVertex = [
    // 下 -z
    ...v0, ...v1, ...v2, ...v3,
    // 上 +z
    ...v3,...v2,...v1, ...v0,
];
- normal
var npz = [0, 0, 1];//[0.1, 0.5, 1];
var nnz = [0, 0, -1];//[0.1, 0.5, -1];
var normals = new Float32Array([
    // 下 -z
    ...nnz, ...nnz, ...nnz, ...nnz,
    ...npz, ...npz, ...npz, ...npz,
    // 上 +z
]);

- st //落到 geometry 中，如果是 webGL中，还是要三角形的每个点都要有对应的 st坐标的
var sts = new Float32Array([
    0, 0,  1, 0,  1, 1,  0, 1,
    0, 0,  1, 0,  1, 1,  0, 1,
]);

- indices
var indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
]);



- shader:
<!-- _vertexShaderSource -->
"
attribute vec3 position3DHigh;
attribute vec3 position3DLow;
attribute vec3 normal;
attribute vec2 st;
attribute float batchId;

varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;

void main()
{
    vec4 p = czm_computePosition();

    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      // position in eye coordinates
    v_normalEC = czm_normal * normal;                         // normal in eye coordinates
    v_st = st;

    gl_Position = czm_modelViewProjectionRelativeToEye * p;
}
"
<!-- fragmentShaderSource:  -->
"
varying vec3 v_positionEC;
varying vec3 v_normalEC;
varying vec2 v_st;

void main()
{
  vec3 positionToEyeEC = -v_positionEC;

  vec3 normalEC = normalize(v_normalEC);
  #ifdef FACE_FORWARD
      normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
  #endif

  czm_materialInput materialInput;
  materialInput.normalEC = normalEC;
  materialInput.positionToEyeEC = positionToEyeEC;
  materialInput.st = v_st;

  czm_material material = czm_getMaterial(materialInput);

  #ifdef FLAT
   gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
  #else

  gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
  #endif
}
"