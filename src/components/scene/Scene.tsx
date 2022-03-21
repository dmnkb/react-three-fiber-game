import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Vector3 } from "three"
import { useThree, useFrame } from "@react-three/fiber"
import { Sky } from "@react-three/drei"
import Chunk from "./terrain/chunk"
import Player from "./player/Player"
import intersectRay from "./intersectRay"

let addQueueIsEmpty = true
// let raycaster: THREE.Raycaster | undefined = undefined;
let cube: THREE.Mesh | undefined = undefined

// let closestChunk: any = null
// let targetVoxel: THREE.Vector3 | undefined = undefined

let playerChunkX: number = 0
let playerChunkZ: number = 0

const Scene = () => {
	const { scene, mouse, raycaster, camera } = useThree()
	const chunks: any = useRef([])

	useEffect(() => {
		//
		const geometry = new THREE.BoxGeometry(1, 1, 1)
		const material = new THREE.MeshBasicMaterial({
			color: 0xff00ff,
		})
		cube = new THREE.Mesh(geometry, material)
		scene.add(cube)
		//
		document.addEventListener("keydown", (data) => onKeyPress(data), false)
	}, [])

	const updateChunks = (playerPos: Vector3) => {
		const loadingRadius = 2 * 32

		// Adding chunks

		let playerChunkX = Math.ceil(playerPos.x / 32) * 32 + 16
		let playerChunkZ = Math.ceil(playerPos.z / 32) * 32 + 16

		let startX = playerChunkX - (Math.floor((loadingRadius * 2) / 32) * 32) / 2
		let startZ = playerChunkZ - (Math.floor((loadingRadius * 2) / 32) * 32) / 2
		let limitX = playerChunkX + (Math.floor((loadingRadius * 2) / 32) * 32) / 2
		let limitZ = playerChunkZ + (Math.floor((loadingRadius * 2) / 32) * 32) / 2

		let chunksLoaded = 0
		let chunksExpectedToBeLoaded = 0

		// simulate amount of chunks that we expect
		// somewhat dumb but does the trick
		// FIXME ?

		for (let x = startX; x < limitX; x += 32) {
			for (let z = startZ; z < limitZ; z += 32) {
				let voxelDistance = Math.round(
					Math.sqrt(Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2))
				)
				if (voxelDistance < loadingRadius) {
					if (!chunks.current[`${x}|${z}`]) {
						chunksExpectedToBeLoaded++
					}
				}
			}
		}

		for (let x = startX; x < limitX; x += 32) {
			for (let z = startZ; z < limitZ; z += 32) {
				let voxelDistance = Math.round(
					Math.sqrt(Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2))
				)

				if (voxelDistance < loadingRadius) {
					if (!chunks.current[`${x}|${z}`]) {
						const c = new Chunk(new Vector3(x - 16, 0, z - 16), (mesh) => {
							mesh.userData["chunk-id"] = `${x}|${z}`
							chunks.current[`${x}|${z}`] = {
								mesh: mesh,
								chunk: c,
							}

							scene.add(mesh)

							chunksLoaded++

							// When all chunks have finished loading
							// start cleanup to prevent race conditions

							if (chunksLoaded === chunksExpectedToBeLoaded) {
								// allow generation of new chunks

								addQueueIsEmpty = true

								// Deleting chunks

								Object.keys(chunks.current).forEach((key: any) => {
									let x = parseInt(key.split("|")[0])
									let z = parseInt(key.split("|")[1])

									if (chunks.current[key]) {
										let voxelDistance = Math.floor(
											Math.sqrt(
												Math.pow(playerPos.x - x, 2) +
													Math.pow(playerPos.z - z, 2)
											)
										)

										if (voxelDistance > loadingRadius) {
											scene.remove(chunks.current[key]["mesh"])
											chunks.current[key]["chunk"] = null // Let the garbage collector do the rest
											chunks.current[key] = null
										}
									}
								})
							}
						})
					}
				}
			}
		}
	}

	let playerMovedBeyondThreshold = (x: number, z: number) => {
		if (addQueueIsEmpty) {
			addQueueIsEmpty = false
			updateChunks(new Vector3(x, 0, z))
		}
	}

	/**
	 *
	 * @param state
	 * @returns
	 */
	const getChunkByRay = (): THREE.Mesh | null => {
		let chunkMeshs: THREE.Mesh[] = []
		Object.values(chunks.current).forEach((chunk: any) => {
			if (chunk) {
				chunkMeshs.push(chunk["mesh"])
				chunk["mesh"].material.color = new THREE.Color(0xffffff)
			}
		})

		raycaster &&
			raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera)

		let intersectingChunks = raycaster.intersectObjects(chunkMeshs)

		if (!intersectingChunks.length) return null

		let closest: any = null
		intersectingChunks.forEach((chunk: any) => {
			if (!closest) {
				closest = chunk
			} else {
				if (chunk.distance < closest.distance) {
					closest = chunk
				}
			}
		})
		return closest.object
	}

	/**
	 *
	 * @param closestChunk
	 * @param state
	 * @returns
	 */
	const getVoxelByRay = (
		closestChunk: THREE.Mesh | null
	): THREE.Vector3 | null => {
		if (!closestChunk) return null

		const rayLength = 32

		let chunk = chunks.current[closestChunk.userData["chunk-id"]]["chunk"]

		let voxelData = chunk.voxelData
		let rayStart = camera.position
		let lookAt = new Vector3()
		camera.getWorldDirection(lookAt)

		let rayEnd = new Vector3(
			rayStart.x + lookAt.x * rayLength,
			rayStart.y + lookAt.y * rayLength,
			rayStart.z + lookAt.z * rayLength
		)

		let voxelIntersection = intersectRay(
			rayStart,
			rayEnd,
			voxelData,
			new THREE.Vector3(playerChunkX, 0, playerChunkZ)
		)

		if (voxelIntersection) {
			// render dummy cube
			if (cube) {
				cube.position.x = Math.round(voxelIntersection.position[0]) + 0.5
				cube.position.y = Math.round(voxelIntersection.position[1]) + 0.5
				cube.position.z = Math.round(voxelIntersection.position[2]) + 0.5
			}
			return new Vector3(
				Math.round(voxelIntersection.position[0]),
				Math.round(voxelIntersection.position[1]),
				Math.round(voxelIntersection.position[2])
			)
		} else {
			if (cube) {
				cube.position.x = 0
				cube.position.y = 0
				cube.position.z = 0
			}
			return null
		}
	}

	useFrame((state, delta) => {
		let chunk: any = getChunkByRay()
		chunk && getVoxelByRay(chunk)
	})

	const onKeyPress = (event: any) => {
		let chunkMesh: any = getChunkByRay()

		if (chunkMesh) {
			let chunkRef = chunks.current[chunkMesh.userData["chunk-id"]]["chunk"]
			let pos = getVoxelByRay(chunkMesh)

			switch (event.keyCode) {
				case 32:
					if (pos) {
						chunkRef.addBlock(
							new THREE.Vector3(
								pos.x - playerChunkX,
								pos.y,
								pos.z - playerChunkZ
							),
							2
						)
					}
					break
				case 66:
					if (pos) {
						chunkRef.removeBlock(
							new THREE.Vector3(
								pos.x - playerChunkX,
								pos.y - 1,
								pos.z - playerChunkZ
							)
						)
					}

					break
				default:
					break
			}
		}
	}

	return (
		<group>
			<Sky
				distance={450000} // Camera distance (default=450000)
				sunPosition={[0, 1, 0]} // Sun position normal (defaults to inclination and azimuth if not set)
				inclination={0} // Sun elevation angle from 0 to 1 (default=0)
				azimuth={0.25} // Sun rotation around the Y axis from 0 to 1 (default=0.25)
			/>
			<Player
				initialPos={new Vector3(0, 56, 0)}
				playerMoveEvent={playerMovedBeyondThreshold}
			/>
		</group>
	)
}

export default Scene
