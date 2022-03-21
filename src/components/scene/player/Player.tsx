import React, { useRef, useState, useContext, useEffect } from "react"
import * as THREE from "three"
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls.js"
import { Vector2, Vector3 } from "three"
import { useFrame, useThree } from "@react-three/fiber"

interface PlayerProps {
	readonly initialPos?: Vector3
	readonly playerMoveEvent: (x: number, z: number) => void
}

let clock: THREE.Clock | undefined = undefined
let controls: FirstPersonControls | undefined = undefined

let lastX = 0
let lastZ = 0

const Player: React.FC<PlayerProps> = ({
	initialPos = new Vector3(0, 56, 0),
	playerMoveEvent,
}) => {
	let { camera } = useThree()

	useEffect(() => {
		clock = new THREE.Clock()
		controls = new FirstPersonControls(camera, document.body)
		controls.movementSpeed = 15
		controls.lookSpeed = 0.5
	}, [])

	// let pos: Vector3 = initialPos
	// let rotation = new Vector3(0, 90, 0)
	// let lastCursorPos = new Vector2(0,0)
	// let camTarget = new Vector3(0,0,0)
	// let camRotationSpeed = new Vector2(100, 100)

	const updateRotation = (cursorX: number, cursorY: number) => {
		// let cursorVec = new Vector2(0,0)
		// if ( cursorX !== lastCursorPos.x ) {
		//   cursorVec.x = lastCursorPos.x - cursorX
		//   lastCursorPos.x = cursorX
		// }
		// if ( cursorY !== lastCursorPos.y ) {
		//   cursorVec.y = lastCursorPos.y - cursorY
		//   lastCursorPos.y = cursorY
		// }
		// rotation.y -= cursorVec.x * camRotationSpeed.x
		// rotation.x -= cursorVec.y * camRotationSpeed.y
		// camTarget.x = pos.x + Math.cos(rotation.y * Math.PI / 180)
		// camTarget.y = pos.y + Math.sin(rotation.x * Math.PI / 180)
		// camTarget.z = pos.z + Math.sin(rotation.y * Math.PI / 180)
	}

	const updatePosition = () => {
		// camera.position.x = pos.x
		// camera.position.y = pos.y
		// camera.position.z = pos.z
	}

	useFrame(state => {
		// updateRotation(state.mouse.x, state.mouse.y)
		// updatePosition()

		controls && controls.update(clock ? clock.getDelta() : 0)

		if (
			Math.ceil(state.camera.position.x / 32) * 32 !== lastX ||
			Math.ceil(state.camera.position.z / 32) * 32 !== lastZ
		) {
			lastX = Math.ceil(state.camera.position.x / 32) * 32
			lastZ = Math.ceil(state.camera.position.z / 32) * 32
			playerMoveEvent(lastX, lastZ)
		}

		// state.camera.lookAt(camTarget)
		// state.camera.position.z = 50 + Math.sin(state.clock.getElapsedTime()) * 30
		// state.camera.updateProjectionMatrix()
	})

	return null
}

export default Player
