import React, { useEffect } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { Vector3 } from "three"
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js"

interface PlayerProps {
	readonly initialPos?: Vector3
	readonly playerMoveEvent: (x: number, z: number) => void
}

let clock: THREE.Clock | undefined = undefined
let controls: FirstPersonControls | undefined = undefined

let lastX = 0
let lastZ = 0

const Player: React.FC<PlayerProps> = ({ initialPos, playerMoveEvent }) => {
	let { camera } = useThree()

	useEffect(() => {
		clock = new THREE.Clock()
		initialPos && camera.position.set(initialPos.x, initialPos.y, initialPos.z)
		controls = new FirstPersonControls(camera, document.body)
		controls.movementSpeed = 15
		controls.lookSpeed = 0.5
	}, [])

	useFrame((state) => {
		controls && controls.update(clock ? clock.getDelta() : 0)

		if (
			Math.ceil(state.camera.position.x / 32) * 32 !== lastX ||
			Math.ceil(state.camera.position.z / 32) * 32 !== lastZ
		) {
			lastX = Math.ceil(state.camera.position.x / 32) * 32
			lastZ = Math.ceil(state.camera.position.z / 32) * 32
			playerMoveEvent(lastX, lastZ)
		}
	})

	return null
}

export default Player
