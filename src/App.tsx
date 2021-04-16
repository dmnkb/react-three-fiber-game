import { useEffect, useState } from 'react'
import './App.scss';
import { Canvas } from '@react-three/fiber'


import { OrbitControls, Stats } from '@react-three/drei'
import Scene from './components/scene/Scene'


function App() {
  return (
    <Canvas camera={{ position: [0, 128, 128], fov: 50 }}>
      <Scene />
      <OrbitControls />
      <Stats />
    </Canvas>
  )
}

export default App;
