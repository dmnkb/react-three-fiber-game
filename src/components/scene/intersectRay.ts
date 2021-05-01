import { vector3ToArrayIndex } from './chunk/helpers'

// from
// http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
// https://threejsfundamentals.org/threejs/lessons/threejs-voxel-geometry.html
const intersectRay = (
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  voxelData: Int8Array,
  chunkOffset: THREE.Vector3
  ) => {
  let dx = end.x - start.x;
  let dy = end.y - start.y;
  let dz = end.z - start.z;
  const lenSq = dx * dx + dy * dy + dz * dz;
  const len = Math.sqrt(lenSq);
  
  dx /= len;
  dy /= len;
  dz /= len;
  
  let t = 0.0;
  let ix = Math.floor(start.x);
  let iy = Math.floor(start.y);
  let iz = Math.floor(start.z);
  
  const stepX = (dx > 0) ? 1 : -1;
  const stepY = (dy > 0) ? 1 : -1;
  const stepZ = (dz > 0) ? 1 : -1;
  
  const txDelta = Math.abs(1 / dx);
  const tyDelta = Math.abs(1 / dy);
  const tzDelta = Math.abs(1 / dz);
  
  const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
  const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
  const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);
  
  // location of nearest voxel boundary, in units of t
  let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
  let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
  let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;
  
  let steppedIndex = -1;
  
  // main loop along raycast vector
  while (t <= len) {
    // const voxel = this.getVoxel(ix, iy, iz);
    const voxel = voxelData[vector3ToArrayIndex(
      ix + chunkOffset.x, 
      iy + chunkOffset.y, 
      iz + chunkOffset.z
      )]
    if (voxel) {
      return {
        position: [
          start.x + t * dx,
          start.y + t * dy,
          start.z + t * dz,
        ],
        normal: [
          steppedIndex === 0 ? -stepX : 0,
          steppedIndex === 1 ? -stepY : 0,
          steppedIndex === 2 ? -stepZ : 0,
        ],
        voxel,
      };
    }
    
    // advance t to next nearest voxel boundary
    if (txMax < tyMax) {
      if (txMax < tzMax) {
        ix += stepX;
        t = txMax;
        txMax += txDelta;
        steppedIndex = 0;
      } else {
        iz += stepZ;
        t = tzMax;
        tzMax += tzDelta;
        steppedIndex = 2;
      }
    } else {
      if (tyMax < tzMax) {
        iy += stepY;
        t = tyMax;
        tyMax += tyDelta;
        steppedIndex = 1;
      } else {
        iz += stepZ;
        t = tzMax;
        tzMax += tzDelta;
        steppedIndex = 2;
      }
    }
  }
  return null;
}

export default intersectRay