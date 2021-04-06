import React from 'react'
import * as THREE from 'three';
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';

export enum Sides {
  back = 0,
  left = 1,
  bottom = 2,
  right = 3,
  top = 4,
  front = 5,
}

export type voxelSide = 
  Sides.left | Sides.right | Sides.top | 
  Sides.bottom | Sides.front | Sides.back

interface VoxelProps {
  readonly meshProps?: MeshProps,
  readonly hideSides?: voxelSide[]
}

const Voxel: React.FC<VoxelProps> = ({meshProps, hideSides, children}) => {

  // prettier-ignore
  const cubeVertices = [
    -1,-1,-1,    1,-1,-1,    1, 1,-1,    -1, 1,-1,
    -1,-1, 1,    1,-1, 1,    1, 1, 1,    -1, 1, 1,
  ];

  // prettier-ignore
  const cubeFaces = [
    2,1,0,    0,3,2,
    0,4,7,    7,3,0,
    0,1,5,    5,4,0,
    1,2,6,    6,5,1,
    2,3,7,    7,6,2,
    4,5,6,    6,7,4
  ];

  hideSides?.sort().reverse().forEach((side: voxelSide, i: number) => {
    for (let i = 0; i < 6; i++) {
      cubeFaces.splice(side * 6, 1)
    }
  }) 

  let geometry = new THREE.PolyhedronGeometry( cubeVertices, cubeFaces, .87, 0 )

  return (    
    <mesh 
      geometry={geometry} 
      castShadow={true}
      receiveShadow={true}
      {...meshProps}>
      <meshStandardMaterial 
        color={0x346A4E}
        />
      {children}
    </mesh>    
  )
}
export default Voxel;
