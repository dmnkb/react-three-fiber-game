import * as THREE from 'three';
import { ReactThreeFiber, Canvas } from '@react-three/fiber'
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';
import { Physics, usePlane, useBox } from '@react-three/cannon'
import * as shapes from '@react-three/drei'
import { 
  Box, 
  OrbitControls, 
  Plane, 
  Sky, 
  Stats,  
  useTexture 
} from '@react-three/drei'

import Chunk from './components/chunk/Chunk'

import './App.scss';
import { Vector3 } from 'three';

const MyPlane: React.FC<MeshProps> = (props: MeshProps) => {

  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0] }))

  const texture = new THREE.TextureLoader().load('./textures/grass.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(128,128)

  return (
    <Plane
      args={[1000, 1000]}
      ref={ref}
      receiveShadow
      {...props as any}
      >      
      <meshStandardMaterial map={texture} /> :
    </Plane>
  )
}

const Scene = () => {

  let sunPosNorm: ReactThreeFiber.Vector3 = [.25,.1,.5]
  let sunDistance = 200
  
  let loadChunkX = 8
  let loadChunkZ = 8

  return (
    <>
      <Sky
        distance={100000}
        turbidity={10}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
        inclination={0.3}
        azimuth={0.25}
        sunPosition={[...sunPosNorm]}
      />
      <ambientLight intensity={.5}/>
      <directionalLight
        castShadow
        position={[
          sunPosNorm[0] * sunDistance,
          sunPosNorm[1] * sunDistance,
          sunPosNorm[2] * sunDistance
        ]}
        intensity={1.5}/>
    
      <group position={[-((loadChunkX-1)*32)/2, 0, -((loadChunkZ-1)*32)/2]}>
        {[...Array(loadChunkX)].map((_, x) => {
          return [...Array(loadChunkZ)].map((_, z) => {
            return <Chunk key={`${x}-${z}`} offset={new Vector3(x*32, 0, z*32)}/>
          })
        })}
      </group>
    </>
  )

  

}


function App() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 3, 15],
        fov: 50
      }}
      >
      <Physics>
        <Scene />
      </Physics>
      <OrbitControls />
      <Stats />
    </Canvas>
  );
}

export default App;
