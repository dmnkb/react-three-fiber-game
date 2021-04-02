import { ReactThreeFiber, Canvas } from '@react-three/fiber'
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';
import { Physics, usePlane, useBox } from '@react-three/cannon'
import { Box, OrbitControls, Plane, Sky } from '@react-three/drei'

import './App.scss';

const MyPlane: React.FC<MeshProps> = (props: MeshProps) => {

  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0] }))

  return (
    <Plane
      args={[1000, 1000]}
      ref={ref}
      receiveShadow
      {...props as any}
      >
      <meshStandardMaterial color={0xF9D7C0} />
    </Plane>
  )
}
const MyBox: React.FC<MeshProps> = (props: MeshProps) => {

  const [ref] = useBox(() => ({ mass: 1, position: props.position as number[] }))

  return (
    <Box
      args={[1, 1, 1]}
      ref={ref}
      castShadow={true}
      receiveShadow={true}
      {...props as any}
      >
      <meshStandardMaterial color={0xE89E9E} />
    </Box>
  )
}

const Scene = () => {
  
  let amountX = 6
  let amountY = 6
  let amountZ = 6

  let sunPosNorm: ReactThreeFiber.Vector3 = [.1,.5,.5]
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
      {[...Array(amountX)].map((_, x) => {
        return [...Array(amountY)].map((_, y) => {
          return [...Array(amountZ)].map((_, z) => {
            return <MyBox 
              position={[
                x - (amountX / 2), 
                y + amountY/2, 
                z - (amountZ / 2)
              ]}
              key={`${x}-${y}-${z}`}/>
          })
        })
      })}
      <MyPlane/>
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
    </Canvas>
  );
}

export default App;
