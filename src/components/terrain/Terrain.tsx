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

  let chunkScale = 16
  
  let voxelData = new Int8Array(Math.pow(chunkScale, 3))

  let horFactor = .015;
  let vertFactor = 4;

  for (let x = 0; x < chunkScale; x++) {
    for (let y = 0; y < chunkScale; y++) {
      for (let z = 0; z < chunkScale; z++) {
        if ( y < ((
          Math.sin(x / chunkScale * 360 * horFactor) * 
          Math.sin(z / chunkScale * 360 * horFactor)) * 
          vertFactor + chunkScale / 2)) {
            voxelData[vector3ToArrayIndex(x,y,z, chunkScale)] = blockTypes.dirt
        }
      }
    }
  }

  let faceDirs = [
    {
      dir: Sides.left,
      vec: [-1, 0, 0],
    },
    {
      dir: Sides.right,
      vec: [1, 0, 0],
    },
    {
      dir: Sides.bottom,
      vec: [0, -1, 0],
    },
    {
      dir: Sides.top,
      vec: [0, 1, 0],
    },
    {
      dir: Sides.back,
      vec: [0, 0, -1],
    },
    {
      dir: Sides.front,
      vec: [0, 0, 1],
    },
  ];
  
  return (
    <group position={[-chunkScale/2, -chunkScale/2, -chunkScale/2,]}>
      {Object.values(voxelData).map((type: blockTypes | null, index: number) => {

        /* Face culling */

        let toHide: Sides[] = []
        let thisCoords = arrayIndexToVector3(index, chunkScale)

        Object.keys(faceDirs).forEach((_, i) => {
          let vec: Vector3 = new Vector3(...faceDirs[i].vec)
          let neighborCoords = new Vector3(
            thisCoords.x + vec.x,
            thisCoords.y + vec.y,
            thisCoords.z + vec.z
          )
          let neighbor = voxelData[
            vector3ToArrayIndex(
              neighborCoords.x,
              neighborCoords.y, 
              neighborCoords.z, 
              chunkScale)]
          
          if (!isInBounds(neighborCoords, chunkScale) || neighbor !== 0) {
            toHide.push(faceDirs[i].dir)
          }
        })
        
        return (
          (type !== 0) &&
            <Voxel 
              meshProps={{ position: thisCoords } as MeshProps} 
              hideSides={toHide}
              key={`${thisCoords.x}-${thisCoords.y}-${thisCoords.z}`}
              >
              {/* <Text
                color={0x000}                
                fontSize={.1}
                lineHeight={1}
                textAlign={'center'}
                anchorX="center"
                anchorY="middle"
                >
                {type}
              </Text> */}
            </Voxel>
        );
      })}
    </group>
  )

}

export default Terrain