
function calculateNormals(vs, ind) {
  const
    x = 0,
    y = 1,
    z = 2,
    ns = [];

  // For each vertex, initialize normal x, normal y, normal z
  for (let i = 0; i < vs.length; i += 3) {
    ns[i + x] = 0.0;
    ns[i + y] = 0.0;
    ns[i + z] = 0.0;
  }

  // We work on triads of vertices to calculate
  for (let i = 0; i < ind.length; i += 3) {
    // Normals so i = i+3 (i = indices index)
    const v1 = [], v2 = [], normal = [];

    // p2 - p1
    v1[x] = vs[3 * ind[i + 2] + x] - vs[3 * ind[i + 1] + x];
    v1[y] = vs[3 * ind[i + 2] + y] - vs[3 * ind[i + 1] + y];
    v1[z] = vs[3 * ind[i + 2] + z] - vs[3 * ind[i + 1] + z];

    // p0 - p1
    v2[x] = vs[3 * ind[i] + x] - vs[3 * ind[i + 1] + x];
    v2[y] = vs[3 * ind[i] + y] - vs[3 * ind[i + 1] + y];
    v2[z] = vs[3 * ind[i] + z] - vs[3 * ind[i + 1] + z];

    // Cross product by Sarrus Rule
    normal[x] = v1[y] * v2[z] - v1[z] * v2[y];
    normal[y] = v1[z] * v2[x] - v1[x] * v2[z];
    normal[z] = v1[x] * v2[y] - v1[y] * v2[x];
    // console.log('%c [ normal ]-35', 'font-size:13px; background:pink; color:#bf2c9f;', normal)
    /*
      normal:[ 0, -0, 0.25 ]
      normal:[ -0, 0, 0.25 ]
    */

    // Update the normals of that triangle: sum of vectors
    for (let j = 0; j < 3; j++) {
      ns[3 * ind[i + j] + x] = ns[3 * ind[i + j] + x] + normal[x];
      ns[3 * ind[i + j] + y] = ns[3 * ind[i + j] + y] + normal[y];
      ns[3 * ind[i + j] + z] = ns[3 * ind[i + j] + z] + normal[z];
    }
  }

  // Normalize the result.
  // The increment here is because each vertex occurs.
  for (let i = 0; i < vs.length; i += 3) {
    // With an offset of 3 in the array (due to x, y, z contiguous values)
    const nn = [];
    nn[x] = ns[i + x];
    nn[y] = ns[i + y];
    nn[z] = ns[i + z];

    let len = Math.sqrt((nn[x] * nn[x]) + (nn[y] * nn[y]) + (nn[z] * nn[z]));
    if (len === 0) len = 1.0;

    nn[x] = nn[x] / len;
    nn[y] = nn[y] / len;
    nn[z] = nn[z] / len;

    ns[i + x] = nn[x];
    ns[i + y] = nn[y];
    ns[i + z] = nn[z];
  }

  return ns;
}

let vertices = [
  0.0, 0.0, 0.0,
  0.5, 0.0, 0.0,
  0.5, 0.5, 0.0,
  0.0, 0.5, 0.0,
]
let indices = [
  0, 1, 2,
  2, 3, 0,
]

// ind[i + 2]//2
// 3 * ind[i + 2]//6
// 3 * ind[i + 2] + x//6
// vs[3 * ind[i + 2] + x]//0.5

// let normals = calculateNormals(vertices, indices);
/*
  [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
  ]
*/


let a = {
  ...["Translate X", "Translate Y", "Translate Z"].reduce(
    (result, name, i) => {
      result[name] = {
        value: 1,
        min: -10,
        max: 10,
        step: -0.1,
        onChange(v, state) {
          // gl.uniform3fv(program.uLightDirection, [
            //   -state["Translate X"],
            //   -state["Translate Y"],
            //   state["Translate Z"],
            // ]);
        },
      };
      return result;
    },
    {}
  ),
}
console.log('%c [ a ]-101', 'font-size:13px; background:pink; color:#bf2c9f;', a)
/*
[ a ]-101 {
  'Translate X': {
    value: 1,
    min: -10,
    max: 10,
    step: -0.1,
    onChange: [Function: onChange]
  },
  'Translate Y': {
    value: 1,
    min: -10,
    max: 10,
    step: -0.1,
    onChange: [Function: onChange]
  },
  'Translate Z': {
    value: 1,
    min: -10,
    max: 10,
    step: -0.1,
    onChange: [Function: onChange]
  }
}
*/