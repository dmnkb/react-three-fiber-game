import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Text } from '@react-three/drei'

import * as Comlink from 'comlink';
//@ts-ignore
import Worker from "worker-loader!./terrainGeneratorWorker.js" // eslint-disable-line import/no-webpack-loader-syntax

import { 
  vector3ToArrayIndex,
  arrayIndexToVector3,
  isInBounds
} from './helpers'

import {
  BlockTypes,
  BlockType,
  Side,
  faces,
  faceDirs
} from './blockTypes'

import { calculateTerrain } from './calculateTerrainSimple'

interface ChunkProps {
  readonly offset: Vector3,
  readonly iterations: number
}

const Chunk: React.FC<ChunkProps> = ({offset, iterations}) => {

  const USE_MULTI_THREADING = true
  const CHUNK_SCALE = 32

  const [loading, setLoading] = useState(true)
  const [voxelData, setVoxelData] = useState(new Int8Array(Math.pow(CHUNK_SCALE, 3)))

  const [id, setID] = useState(0)

  const tileTextureWidth = 256;
  const tileTextureHeight = 64;
  const tileSize = 16;

  function callback(value: any) {
    setLoading(false)
    setVoxelData(value)
  }

  async function init(offset: Vector3, CHUNK_SCALE: number) {
    const worker = new Worker();
    const remoteFunction: any = Comlink.wrap(worker);
    await remoteFunction(Comlink.proxy(callback), offset, CHUNK_SCALE);
  }

  // useEffect(() => {
  //   USE_MULTI_THREADING ?
  //     init(offset, CHUNK_SCALE) :
  //   calculateTerrain(offset, CHUNK_SCALE).then((data) => {
  //     setVoxelData(data)
  //     setLoading(false)
  //   })
  // },[])

  // useMemo(() => {
  //   USE_MULTI_THREADING ?
  //   init(offset, CHUNK_SCALE) :
  //   calculateTerrain(offset, CHUNK_SCALE).then((data) => {
  //     setVoxelData(data)
  //     setLoading(false)
  //   })  
  // }, [offset])

  useEffect(() => {
    setID(Math.floor(Math.random() * 64))
    // USE_MULTI_THREADING ?
    // init(offset, CHUNK_SCALE) :
    // calculateTerrain(offset, CHUNK_SCALE).then((data) => {
    //   setVoxelData(data)
    //   setLoading(false)
    // })  
  }, [])

  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const uvs: number[] = []
  
  // Mesh generation

  voxelData.forEach( (type: BlockType, index: number) => {

    if (type !== 0) {

      const uvTextureOffset = type - 1;  // voxel 0 is sky so for UVs we start at 0
      
      let thisCoords = arrayIndexToVector3(index, CHUNK_SCALE)
      
      faces.forEach( (side: Side) => {

        let thisSide = faceDirs[side]
        
        let neighborCoords = new Vector3(
          thisCoords.x + thisSide.vec[0],
          thisCoords.y + thisSide.vec[1],
          thisCoords.z + thisSide.vec[2])

        let neighbor = voxelData[
          vector3ToArrayIndex(
            neighborCoords.x,
            neighborCoords.y, 
            neighborCoords.z, 
            CHUNK_SCALE)]
        
        if (!isInBounds(neighborCoords, CHUNK_SCALE) || neighbor === 0) {

          const ndx = positions.length / 3;
          indices.push(
            ndx, ndx + 1, ndx + 2,
            ndx + 2, ndx + 1, ndx + 3)

          for (const {pos, uv} of thisSide.corners) {

            // Positions
            positions.push(
              (pos[0] + thisCoords.x + offset.x), 
              (pos[1] + thisCoords.y + offset.y), 
              (pos[2] + thisCoords.z) + offset.z);

            // Normals
            normals.push(...[thisSide.vec[0], thisSide.vec[1], thisSide.vec[2]])           

            // UVs

            // Special condition: Dirt has another texture 
            // on it's sides when there is a neighbor above.

            let hasTopNeighbor = voxelData[vector3ToArrayIndex(
              thisCoords.x + faceDirs["top"].vec[0],
              thisCoords.y + faceDirs["top"].vec[1],
              thisCoords.z + faceDirs["top"].vec[2],
              CHUNK_SCALE)] !== 0

            let isBlockHorizontallSide = side !== "top" && side !== "bottom"

            if (type === BlockTypes.dirt && hasTopNeighbor && isBlockHorizontallSide) {
              uvs.push(
                (uvTextureOffset + uv[0]) * tileSize / tileTextureWidth,
              1-(faceDirs["bottom"].uvRow + 1 - uv[1]) * tileSize / tileTextureHeight)
            } else {
              uvs.push(
                (uvTextureOffset + uv[0]) * tileSize / tileTextureWidth,
                1-(thisSide.uvRow + 1 - uv[1]) * tileSize / tileTextureHeight)
            }
          
          }

        }

      })
    
    }

  })

  const geometry = new THREE.BufferGeometry();
  const texture = new THREE.TextureLoader().load('./textures/terrain.png');
  texture.encoding = THREE.sRGBEncoding
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapLinearFilter;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
    alphaTest: 0,
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
    loading ? 
    <Text
      color={0x000}
      position={new Vector3(
        offset.x + CHUNK_SCALE/2,
        offset.y,
        offset.z + CHUNK_SCALE/2
        )}
      fontSize={3}
      lineHeight={1}
      letterSpacing={-0.08}
      textAlign={'center'}
      anchorX="center"
      anchorY="middle"
    >{`${id} / ${iterations}`}</Text> :
    <group position={[-CHUNK_SCALE/2, -CHUNK_SCALE/2, -CHUNK_SCALE/2,]}>
      <mesh geometry={geometry && geometry} material={material}>
      </mesh>
    </group>
  )

}

export default Chunk