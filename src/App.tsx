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

import Voxel, { Sides } from './components/voxel/Voxel'
import Terrain from './components/terrain/Terrain'

import './App.scss';

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
  let sunDistance = 20

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
      <Terrain />
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
