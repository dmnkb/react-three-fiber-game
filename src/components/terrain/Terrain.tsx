import React from 'react'
import * as THREE from 'three';
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';

import Voxel, { Sides } from '../voxel/Voxel'
import { Vector3 } from 'three';

enum blockTypes {
  dirt = 1,
  rock = 2
}

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

const Terrain: React.FC = () => {

  let chunkScale = 256
  
  let voxelData = new Int8Array(Math.pow(chunkScale, 3))

  let horFactor = .015;
  let vertFactor = 36;
  let heightLevel = chunkScale / 1.5;

  for (let x = 0; x < chunkScale; x++) {
    for (let y = 0; y < chunkScale; y++) {
      for (let z = 0; z < chunkScale; z++) {
        if ( y < ((
          Math.sin(x / chunkScale * 360 * horFactor) * 
          Math.sin(z / chunkScale * 360 * horFactor)) * 
          vertFactor + heightLevel / 2)) {
            voxelData[vector3ToArrayIndex(x,y,z, chunkScale)] = blockTypes.dirt
        }
      }
    }
  }

  const faceDirs = [
    {
      dir: Sides.left,
      vec: [-1, 0, 0],
      corners: [
        [ 0, 1, 0 ],
        [ 0, 0, 0 ],
        [ 0, 1, 1 ],
        [ 0, 0, 1 ],
      ]
    },
    {
      dir: Sides.right,
      vec: [1, 0, 0],
      corners: [
        [ 1, 1, 1 ],
        [ 1, 0, 1 ],
        [ 1, 1, 0 ],
        [ 1, 0, 0 ],
      ]
    },
    {
      dir: Sides.bottom,
      vec: [0, -1, 0],
      corners: [
        [ 1, 0, 1 ],
        [ 0, 0, 1 ],
        [ 1, 0, 0 ],
        [ 0, 0, 0 ],
      ]
    },
    {
      dir: Sides.top,
      vec: [0, 1, 0],
      corners: [
        [ 0, 1, 1 ],
        [ 1, 1, 1 ],
        [ 0, 1, 0 ],
        [ 1, 1, 0 ],
      ]
    },
    {
      dir: Sides.back,
      vec: [0, 0, -1],
      corners: [
        [ 1, 0, 0 ],
        [ 0, 0, 0 ],
        [ 1, 1, 0 ],
        [ 0, 1, 0 ],
      ]
    },
    {
      dir: Sides.front,
      vec: [0, 0, 1],
      corners: [
        [ 0, 0, 1 ],
        [ 1, 0, 1 ],
        [ 0, 1, 1 ],
        [ 1, 1, 1 ],
      ]
    }
  ]

  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  Object.values(voxelData).forEach( (type: blockTypes | null, index: number) => {

    if (type !== 0) {

      /* Face culling */
      // let toHide: Sides[] = []
      let thisCoords = arrayIndexToVector3(index, chunkScale)

      for (let i = 0; i < 6; i++) {

        let vec: Vector3 = new Vector3(...faceDirs[i].vec)
        let neighborCoords = new Vector3(
          thisCoords.x + vec.x,
          thisCoords.y + vec.y,
          thisCoords.z + vec.z)

        let neighbor = voxelData[
          vector3ToArrayIndex(
            neighborCoords.x,
            neighborCoords.y, 
            neighborCoords.z, 
            chunkScale)]

        // Restult is valid (= inside chunk) && no neighbor
        if (isInBounds(neighborCoords, chunkScale) && neighbor === 0) {
          // Draw face at given coords at given side
          const ndx = positions.length / 3;
          for (const pos of faceDirs[i].corners) {
            positions.push(
              pos[0] + thisCoords.x, 
              pos[1] + thisCoords.y, 
              pos[2] + thisCoords.z);
            let tempVec = [vec.x, vec.y, vec.z]
            normals.push(...tempVec);
          }
          indices.push(
            ndx, ndx + 1, ndx + 2,
            ndx + 2, ndx + 1, ndx + 3,
          );
        }

      } // End faceDirs loop
      
    }

  })

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshLambertMaterial({color: 0x346A4E});

  const positionNumComponents = 3;
  const normalNumComponents = 3;
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      new Float32Array(positions), 
      positionNumComponents));
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(
      new Float32Array(normals), 
      normalNumComponents));
  geometry.setIndex(indices);
  
  return (
    <group position={[-chunkScale/2, -chunkScale/2, -chunkScale/2,]}>
      <mesh 
        geometry = {geometry}
        material = {material}>
      </mesh>
    </group>
  )

}

export default Terrain