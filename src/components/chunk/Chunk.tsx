import React from 'react'
import * as THREE from 'three';
import { Vector3 } from 'three';

/**
 * Convert a vector 3 coordinate to a flat array index
 * @param x {number} The x coordinate
 * @param y {number} The y coordinate
 * @param z {number} The z coordinate
 * @param size {number} The size of each dimension, the size is the same for each one
 */
const vector3ToArrayIndex = (x: number, y: number, z: number, size: number = 32) =>
  (size * size * x) + (size * y) + z;

/**
 * Convert a flat array index to a 3D coordinate representation
 * @param index {number} The array index
 * @param size {number} The size of x,y,z dimension
 */
const arrayIndexToVector3 = (index: number, size: number = 32) =>
  new THREE.Vector3(
    (index / (size * size)) >> 0,
    ((index / size) % size) >> 0,
    (index % size) >> 0)

/**
 * Check if coords are within the chunk bounds.
 * vector3ToArrayIndex sometimes returns values even though
 * the coords lay outside the bounds. Use this as insurance.
 * @param vec {Vector3}
 * @param size {number}
 * @returns true if coords lay outside the bounds
 */
const isInBounds = (vec: Vector3, size: number) =>
  vec.x >= 0 && vec.x < size &&
  vec.y >= 0 && vec.y < size &&
  vec.z >= 0 && vec.z < size 

enum blockTypes {
  dirt = 1,
  rock = 2
}

interface ChunkProps {
  readonly offset: Vector3
}

const Chunk: React.FC<ChunkProps> = ({offset}) => {

  let chunkScale = 32
  
  let voxelData = new Int8Array(Math.pow(chunkScale, 3))

  const tileSize = 16;
  const tileTextureWidth = 256;
  const tileTextureHeight = 64;

  for (let x = offset.x; x < offset.x + chunkScale; x++) {
    for (let y = offset.y; y < offset.y + chunkScale; y++) {
      for (let z = offset.z; z < offset.z + chunkScale; z++) {
        let height = (Math.sin(x / chunkScale * Math.PI * 2) + Math.sin(z / chunkScale * Math.PI * 2)) * (chunkScale / 6) + (chunkScale / 2);
        if ( y < height) {
          voxelData[vector3ToArrayIndex(
            x-offset.x, y-offset.y, z-offset.z, chunkScale)] = (y > 16) ? blockTypes.rock : blockTypes.dirt
        }
      }
    }
  }

  const faceDirs = [
    { // left
      uvRow: 0,
      vec: [-1, 0, 0],
      corners: [
        { pos: [ 0, 1, 0 ], uv: [ 0, 1 ], },
        { pos: [ 0, 0, 0 ], uv: [ 0, 0 ], },
        { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
        { pos: [ 0, 0, 1 ], uv: [ 1, 0 ], },
      ]
    },
    { // right
      uvRow: 0,
      vec: [1, 0, 0],
      corners: [
        { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
        { pos: [ 1, 0, 1 ], uv: [ 0, 0 ], },
        { pos: [ 1, 1, 0 ], uv: [ 1, 1 ], },
        { pos: [ 1, 0, 0 ], uv: [ 1, 0 ], },
      ]
    },
    { // bottom
      uvRow: 1,
      vec: [0, -1, 0],
      corners: [
        { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
        { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
        { pos: [ 1, 0, 0 ], uv: [ 1, 1 ], },
        { pos: [ 0, 0, 0 ], uv: [ 0, 1 ], },
      ]
    },
    { // top
      uvRow: 2,
      vec: [0, 1, 0],
      corners: [
        { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
        { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
        { pos: [ 0, 1, 0 ], uv: [ 1, 0 ], },
        { pos: [ 1, 1, 0 ], uv: [ 0, 0 ], },
      ]
    },
    { // back
      uvRow: 0,
      vec: [0, 0, -1],
      corners: [
        { pos: [ 1, 0, 0 ], uv: [ 0, 0 ], },
        { pos: [ 0, 0, 0 ], uv: [ 1, 0 ], },
        { pos: [ 1, 1, 0 ], uv: [ 0, 1 ], },
        { pos: [ 0, 1, 0 ], uv: [ 1, 1 ], },
      ]
    },
    { // front
      uvRow: 0,
      vec: [0, 0, 1],
      corners: [
        { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
        { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
        { pos: [ 0, 1, 1 ], uv: [ 0, 1 ], },
        { pos: [ 1, 1, 1 ], uv: [ 1, 1 ], },
      ]
    }
  ]

  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const uvs: number[] = [];

  Object.values(voxelData).forEach( (type: blockTypes, index: number) => {

    if (type !== 0) {

      const uvVoxel = type - 1;  // voxel 0 is sky so for UVs we start at 0
      
      let thisCoords = arrayIndexToVector3(index, chunkScale)
      
      for (const {uvRow, vec, corners} of faceDirs)  {
        
        let neighborCoords = new Vector3(
          thisCoords.x + vec[0],
          thisCoords.y + vec[1],
          thisCoords.z + vec[2])

        let neighbor = voxelData[
          vector3ToArrayIndex(
            neighborCoords.x,
            neighborCoords.y, 
            neighborCoords.z, 
            chunkScale)]

        // For the time being we draw faces at the edges of chunks
        if (!isInBounds(neighborCoords, chunkScale) || neighbor === 0) {
          // Draw face at given coords at given side
          const ndx = positions.length / 3;
          for (const {pos, uv} of corners) {
            positions.push(
              (pos[0] + thisCoords.x + offset.x), 
              (pos[1] + thisCoords.y + offset.y), 
              (pos[2] + thisCoords.z) + offset.z);
            normals.push(...[vec[0], vec[1], vec[2]]);
            uvs.push(
                (uvVoxel +   uv[0]) * tileSize / tileTextureWidth,
              1-(uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
          }
          indices.push(
            ndx, ndx + 1, ndx + 2,
            ndx + 2, ndx + 1, ndx + 3,
          )
        }

      }
      
    }

  })

  const geometry = new THREE.BufferGeometry();

  const texture = new THREE.TextureLoader().load('./textures/terrain.png');
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.FrontSide,
    alphaTest: 0.1,
    transparent: true,
  });

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;

  geometry.setAttribute('position',
    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute('normal',
    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
    geometry.setAttribute('uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
  geometry.setIndex(indices);
  
  return (
    <group position={[-chunkScale/2, -chunkScale/2, -chunkScale/2,]}>
      <mesh 
        geometry = {geometry}
        material = {material}
        // receiveShadow
        // castShadow={true}
        >
      </mesh>
    </group>
  )

}

export default Chunk