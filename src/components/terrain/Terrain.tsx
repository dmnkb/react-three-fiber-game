import React, { useEffect } from 'react'
import * as THREE from 'three';
import { Text } from '@react-three/drei'
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';

import Voxel, { Sides } from '../voxel/Voxel'

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
 export function vector3ToArrayIndex(x: number, y: number, z: number, size: number = 32) {
  return (size * size * x) + (size * y) + z;
}

/**
 * Convert a flat array index to a 3D coordinate representation
 * @param index {number} The array index
 * @param size {number} The size of x,y,z dimension
 */
export function arrayIndexToVector3(index: number, size: number = 32) {
  return new THREE.Vector3(
    (index / (size * size)) >> 0,
    ((index / size) % size) >> 0,
    (index % size) >> 0
  );
}

const Terrain: React.FC = () => {

  let amountX = 12
  let amountY = 12
  let amountZ = 12
  
  let voxelData = new Int8Array(amountX * amountY * amountZ)

  let faceDirs = [
    { // left
      dir: [ -1,  0,  0, ],
    },
    { // right
      dir: [  1,  0,  0, ],
    },
    { // bottom
      dir: [  0, -1,  0, ],
    },
    { // top
      dir: [  0,  1,  0, ],
    },
    { // back
      dir: [  0,  0, -1, ],
    },
    { // front
      dir: [  0,  0,  1, ],
    },
  ];

  let horFactor = .015;
  let vertFactor = 3;

  for (let x = 0; x < amountX; x++) {
    for (let y = 0; y < amountY; y++) {
      for (let z = 0; z < amountZ; z++) {
        if ( y < ((Math.sin(x / amountX * 360 * horFactor) * Math.sin(z / amountZ * 360 * horFactor)) * vertFactor + 3) ) {
          voxelData[vector3ToArrayIndex(x,y,z, amountX)] = blockTypes.dirt
        }
      }
    }
  }
  
  return (
    <>
      {Object.values(voxelData).map((type: blockTypes | null, index: number) => {

        let toHide: Sides[] = []
        let thisCoords = arrayIndexToVector3(index, amountX)

        let neighborTop = (thisCoords.y + 1 === amountY) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x,
            thisCoords.y + 1,
            thisCoords.z,
            amountX)])
        if (neighborTop && neighborTop === 1)
           toHide.push(Sides.top)
        
        let neighborBottom = (thisCoords.y === 0) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x,
            thisCoords.y - 1,
            thisCoords.z,
            amountX)])
        if (neighborBottom && neighborBottom === 1)
           toHide.push(Sides.bottom)
        
        let neighborLeft = (thisCoords.x === 0) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x - 1,
            thisCoords.y,
            thisCoords.z,
            amountX)])
        if (neighborLeft && neighborLeft === 1)
           toHide.push(Sides.left)
        
        let neighborRight = (thisCoords.x + 1 === amountX) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x + 1,
            thisCoords.y,
            thisCoords.z,
            amountX)])
        if (neighborRight && neighborRight === 1)
           toHide.push(Sides.right)
        
        let neighborBack = (thisCoords.z === 0) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x,
            thisCoords.y,
            thisCoords.z - 1,
            amountX)])
        if (neighborBack && neighborBack === 1)
           toHide.push(Sides.back)
        
        
        let neighborFront = (thisCoords.z + 1 === amountZ) ?
          undefined : (voxelData[vector3ToArrayIndex(
            thisCoords.x,
            thisCoords.y,
            thisCoords.z + 1,
            amountX)])
        if (neighborFront && neighborFront === 1)
           toHide.push(Sides.front)
        
        return (
          (type !== 0) &&
            <Voxel 
              meshProps={{ position: thisCoords } as MeshProps} 
              hideSides={toHide}
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
    </>
  )

}

export default Terrain