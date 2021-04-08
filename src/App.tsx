import './App.scss';
import { useRef, useEffect } from 'react'
import { Vector3 } from 'three';
import { ReactThreeFiber, Canvas, useThree, useFrame } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'

import { 
  OrbitControls, 
  Sky, 
  Stats
} from '@react-three/drei'

import Chunk from './components/chunk/Chunk'
import { ShaderEffects } from './Effects'


const Scene = () => {

  let sunPosNorm: ReactThreeFiber.Vector3 = [.25,.8,.5]
  let sunDistance = 200
  
  let loadChunkX = 6
  let loadChunkZ = 6

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
      <ambientLight 
        intensity={.25}
        color={0xffffff}        
        />
      {/* <directionalLight
        castShadow
        position={[
          sunPosNorm[0] * sunDistance,
          sunPosNorm[1] * sunDistance,
          sunPosNorm[2] * sunDistance
        ]}
        intensity={.5}
        color={'orange'}
        /> */}
    
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
        position: [0, 16, 32],
        fov: 50
      }}
      >
      <Physics>
        <Scene />
      </Physics>
      <OrbitControls />
      <Stats />
      <ShaderEffects />
    </Canvas>
  );
}

export default App;
