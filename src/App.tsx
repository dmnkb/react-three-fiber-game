import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'

import Scene from './components/scene/Scene'
import DemoUI from './components/ui/DemoUI'

import './App.scss';

function App() {
  return (
    <div className="container">
      <Canvas>
        <Scene />
        <Stats />
      </Canvas>
      <DemoUI />
    </div>
  )
}

export default App;
