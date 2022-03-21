import { Canvas } from "@react-three/fiber"
import { Stats } from "@react-three/drei"

import Scene from "./components/scene/Scene"

import "./App.scss"

function App() {
	return (
		<div className="container">
			<Canvas>
				<Scene />
				<Stats />
			</Canvas>
		</div>
	)
}

export default App
