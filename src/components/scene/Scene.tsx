import { useEffect, useRef } from 'react'
import * as THREE from 'three';
import { Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber'
import { StoreContext } from '../../state/Context'

import { Sky } from '@react-three/drei'
import Chunk from './terrain/chunk'
document.addEventListener('onPointerDown', (event) => {event.preventDefault();console.log("test")}, false);

let addQueueIsEmpty = true

const Scene = () => {

  const { scene } = useThree()

  const geometry = new THREE.SphereGeometry( 8 );
  const material = new THREE.MeshBasicMaterial({ color: 'red', opacity: .5 });
  let ballMesh = useRef<THREE.Mesh>(null!)

  const chunks: any = useRef([])

  useEffect(() => {
    ballMesh.current = new THREE.Mesh( geometry, material );
    document.addEventListener("keydown", onKeyPress, false);
    scene.add(ballMesh.current)
    
  }, [])

  const updateChunks = (playerPos: Vector3) => {
    
    const loadingRadius = 4 * 32

    // Adding chunks

    let roundedCenterX = (Math.ceil(playerPos.x/32) * 32) + 16;
    let roundedCenterZ = (Math.ceil(playerPos.z/32) * 32) + 16;

    let startX = (roundedCenterX - ((Math.floor(loadingRadius * 2 / 32) * 32 / 2)))
    let startZ = (roundedCenterZ - ((Math.floor(loadingRadius * 2 / 32) * 32 / 2)))
    let limitX = (roundedCenterX + (Math.floor(loadingRadius * 2 / 32) * 32 / 2))
    let limitZ = (roundedCenterZ + (Math.floor(loadingRadius * 2 / 32) * 32 / 2))

    let chunksLoaded = 0
    let chunksExpectedToBeLoaded = 0

    // simulate amount of chunks that we expect
    // somewhat dumb but does the trick
    // FIXME ?

    for (let x = startX; x < limitX; x += 32) {
      for (let z = startZ; z < limitZ; z += 32) {
        let voxelDistance = Math.round(Math.sqrt(
          Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2)))
        if (voxelDistance < loadingRadius) {
          if (!chunks.current[`${x}|${z}`]) {
            chunksExpectedToBeLoaded++
          }
        }
      }
    }

    for (let x = startX; x < limitX; x += 32) {
      for (let z = startZ; z < limitZ; z += 32) {

        let voxelDistance = Math.round(Math.sqrt(
          Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2)))

        if (voxelDistance < loadingRadius) {
          
          if (!chunks.current[`${x}|${z}`]) {

            const c = new Chunk(new Vector3(x - 16, 0, z - 16), (mesh) => {
              chunks.current[`${x}|${z}`] = {"mesh": mesh, "chunk": c}
              console.log(`${x}|${z}`)
              console.log(chunks.current[`${x}|${z}`])
              scene.add(mesh)

              chunksLoaded++

              // When all chunks have finished loading 
              // start cleanup to prevent race conditions

              if ( chunksLoaded === chunksExpectedToBeLoaded) {

                // allow generation of new chunks

                addQueueIsEmpty = true

                // Deleting chunks

                Object.keys(chunks.current).forEach((key: any) => {

                  let x = parseInt(key.split("|")[0])
                  let z = parseInt(key.split("|")[1])

                  if ( chunks.current[key] ) {

                    let voxelDistance = Math.floor(Math.sqrt(
                      Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2)))

                    if (voxelDistance > loadingRadius) {
                      scene.remove(chunks.current[key]["mesh"])
                      chunks.current[key]["chunk"] = null // Let the garbage collector do the rest
                      chunks.current[key] = null
                    }

                  }

                })

              }

            })

          }

        }

      }
    }
    
  }

  // Simulate player movement

  let testPos = new Vector3(0,0,0)
  let radius = 32
  let angle = 0;

  let lastX = 0
  let lastZ = 0
  
  useFrame((state, delta) => {

    angle = angle < 360 ? angle + 0 : 0
    testPos = new Vector3(
      4 * Math.sin(angle * Math.PI / 180) * radius, 
      0,
      4 * Math.cos(angle * Math.PI / 180) * radius,
    )

    ballMesh.current.position.x = testPos.x
      ballMesh.current.position.y = 32
      ballMesh.current.position.z = testPos.z

    if ((Math.ceil(testPos.x/32) * 32) !== lastX ||
        (Math.ceil(testPos.z/32) * 32) !== lastZ) {

      lastX = (Math.ceil(testPos.x/32) * 32)
      lastZ = (Math.ceil(testPos.z/32) * 32)

      // prevent race conditions
      if ( addQueueIsEmpty ) {
        addQueueIsEmpty = false
        updateChunks(new Vector3(lastX, 0, lastZ))
      }
      
      // console.log("scene items", scene.children.length)
      
    }

  })

  const onKeyPress = (event: any) => {
    
    let thisChunk = chunks.current['80|80']
    console.log(thisChunk)

    if (thisChunk && thisChunk['mesh']) {

      thisChunk["chunk"].addBlock(new Vector3(8,15,8), 2, (mesh: THREE.Mesh) => {
        scene.remove(thisChunk['mesh'])
        thisChunk['mesh'] = mesh
        scene.add(mesh)
      })

      thisChunk["chunk"].removeBlock(new Vector3(8,10,8), (mesh: THREE.Mesh) => {
        scene.remove(thisChunk['mesh'])
        thisChunk['mesh'] = mesh
        scene.add(mesh)
      })
    }
  }

  return (
    <group>
      <Sky
        distance={450000} // Camera distance (default=450000)
        sunPosition={[0, 1, 0]} // Sun position normal (defaults to inclination and azimuth if not set)
        inclination={0} // Sun elevation angle from 0 to 1 (default=0)
        azimuth={0.25} // Sun rotation around the Y axis from 0 to 1 (default=0.25)
      />
    </group>
  )
}

export default Scene;
