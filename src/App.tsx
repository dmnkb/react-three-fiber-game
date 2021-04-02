import { Canvas } from '@react-three/fiber'
import { MeshProps } from '@react-three/fiber/dist/declarations/src/three-types';
import { Physics, usePlane, useBox } from '@react-three/cannon'

import { Box } from '@react-three/drei'

import './App.scss';

function Plane() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0] }))
  return (
    <mesh ref={ref}>
      <planeBufferGeometry args={[100, 100]} />
    </mesh>
  )
}
const MyBox: React.FC<MeshProps> = (props: MeshProps) => {

  const [ref] = useBox(() => ({ mass: 1, position: props.position as number[] }))

  return (
    <Box
      args={[1, 1, 1]}
      ref={ref}
      {...props as any}
      >
      <meshStandardMaterial color={'hotpink'} />
    </Box>
  )
}

const Scene = () => {
  
  let amountX = 6
  let amountY = 6
  let amountZ = 6

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
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
      <Plane/>
    </>
  )

}

function App() {
  return (
    <Canvas
      camera={{
        position: [0, 3, 15],
        fov: 70
      }}>
      <Physics>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Scene />
      </Physics>
    </Canvas>
  );
}

export default App;
