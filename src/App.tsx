import './App.scss';
import { Vector3 } from 'three';
import { ReactThreeFiber, Canvas} from '@react-three/fiber'

import { 
  OrbitControls, 
  Sky, 
  Stats
} from '@react-three/drei'

import Chunk from './components/chunk/Chunk'

const Scene = () => {

  let sunPosNorm: ReactThreeFiber.Vector3 = [.25,.8,.5]
  
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
      camera={{
        position: [0, 128, 256],
        fov: 50
      }}>
      <Scene />
      <OrbitControls />
      <Stats />
    </Canvas>
  );
}

export default App;
