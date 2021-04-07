import React from 'react'
import { Vector3 } from 'three';
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';
import { Plane } from '@react-three/drei'

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
  readonly position: Vector3
  readonly hideSides?: voxelSide[]
  readonly meshProps?: MeshProps
}

const Voxel: React.FC<VoxelProps> = ({meshProps, hideSides, position, children}) => {

  let cubeTransformations = [
    {
      dir: Sides.left,
      vec: [-.5, 0, 0],
      rotate: [0, -90, 0]
    },
    {
      dir: Sides.right,
      vec: [.5, 0, 0],
      rotate: [0, 90, 0]
    },
    {
      dir: Sides.bottom,
      vec: [0, -.5, 0],
      rotate: [90, 0, 0]
    },
    {
      dir: Sides.top,
      vec: [0, .5, 0],
      rotate: [-90, 0, 0]
    },
    {
      dir: Sides.back,
      vec: [0, 0, -.5],
      rotate: [0, 180, 0]
    },
    {
      dir: Sides.front,
      vec: [0, 0, .5],
      rotate: [0, 0, 0]
    },
  ];

  return (    
    <>
      {cubeTransformations.map((side, i) => {
        if (!hideSides?.includes(side.dir)) {
          return <Plane
            args={[1, 1]}
            receiveShadow
            castShadow={true}
            position={[
              position.x + side.vec[0],
              position.y + side.vec[1],
              position.z + side.vec[2]
            ]}
            rotation={[
              side.rotate[0] * Math.PI / 180,
              side.rotate[1] * Math.PI / 180,
              side.rotate[2] * Math.PI / 180,
            ]}
            {...meshProps as any}
            >      
            <meshStandardMaterial color={0x346A4E} />
          </Plane>
        }
      })}
    </>
  )
}
export default Voxel;
