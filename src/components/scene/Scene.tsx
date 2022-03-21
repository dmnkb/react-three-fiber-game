import { useEffect, useRef } from "react"
import { Vector3 } from "three"
import { useThree } from "@react-three/fiber"
import { Sky } from "@react-three/drei"
import Chunk from "./terrain/chunk"
import Player from "./player/Player"

const LOAD_RADIUS = 2 * 32

const Scene = () => {
	const { scene } = useThree()
	const chunks: any = useRef([])

	let addQueueIsEmpty = true

	useEffect(() => {
		updateChunks(new Vector3(0, 0, 0))
	}, [])

	const updateChunks = (playerPos: Vector3) => {
		// Add chunks

		let playerChunkX = Math.ceil(playerPos.x / 32) * 32 + 16
		let playerChunkZ = Math.ceil(playerPos.z / 32) * 32 + 16

		let startX = playerChunkX - (Math.floor((LOAD_RADIUS * 2) / 32) * 32) / 2
		let startZ = playerChunkZ - (Math.floor((LOAD_RADIUS * 2) / 32) * 32) / 2
		let limitX = playerChunkX + (Math.floor((LOAD_RADIUS * 2) / 32) * 32) / 2
		let limitZ = playerChunkZ + (Math.floor((LOAD_RADIUS * 2) / 32) * 32) / 2

		let chunksLoaded = 0
		let chunksExpectedToBeLoaded = 0

		// Calculate absolute number of chunks to keep track of

		for (let x = startX; x < limitX; x += 32) {
			for (let z = startZ; z < limitZ; z += 32) {
				let voxelDistance = Math.round(
					Math.sqrt(Math.pow(playerPos.x - x, 2) + Math.pow(playerPos.z - z, 2))
				)
				if (voxelDistance < LOAD_RADIUS) {
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

				if (voxelDistance < LOAD_RADIUS) {
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

										if (voxelDistance > LOAD_RADIUS) {
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

	return (
		<group>
			<Sky
				distance={450000} // Camera distance (default=450000)
				sunPosition={[0, 1, 0]} // Sun position normal (defaults to inclination and azimuth if not set)
				inclination={0} // Sun elevation angle from 0 to 1 (default=0)
				azimuth={0.25} // Sun rotation around the Y axis from 0 to 1 (default=0.25)
			/>
			<Player
				initialPos={new Vector3(0, 24, 0)}
				playerMoveEvent={playerMovedBeyondThreshold}
			/>
		</group>
	)
}

export default Scene
