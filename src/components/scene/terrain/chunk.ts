import React, { useEffect, useMemo, useState } from "react"
import * as THREE from "three"
import { Vector3 } from "three"
import { Text } from "@react-three/drei"

import * as Comlink from "comlink"
//@ts-ignore
import Worker from "worker-loader!./terrainGeneratorWorker.js" // eslint-disable-line import/no-webpack-loader-syntax

import { vector3ToArrayIndex, arrayIndexToVector3, isInBounds } from "./helpers"

import { BlockTypes, BlockType, Side, faces, faceDirs } from "./blockTypes"

/**
 *
 * @param offset Vector3
 * @returns
 */
class Chunk {
	offset: Vector3
	callback: (mesh: THREE.Mesh) => any

	USE_MULTI_THREADING = true
	CHUNK_SCALE = 32

	tileTextureWidth = 256
	tileTextureHeight = 64
	tileSize = 16

	voxelData = new Int8Array(Math.pow(this.CHUNK_SCALE, 3))
	mesh: THREE.Mesh | undefined = undefined

	/**
	 * Convert a vector 3 coordinate to a flat array index
	 * @param x {number} The x coordinate
	 * @param y {number} The y coordinate
	 * @param z {number} The z coordinate
	 * @param size {number} The size of each dimension, the size is the same for each one
	 */
	vector3ToArrayIndex = (x: number, y: number, z: number, size = 32) =>
		size * size * x + size * y + z

	constructor(offset: Vector3, callback: (mesh: THREE.Mesh) => any) {
		this.offset = offset
		this.callback = callback
		this.init(offset, this.CHUNK_SCALE)

		// const colors = [
		//   'red',
		//   'blue',
		//   'yellow',
		//   'purple',
		//   'orange',
		//   'violet',
		//   'gold',
		//   'magenta',
		//   'silver',
		//   'green',
		//   'black'
		// ]

		// const geometry = new THREE.BoxGeometry( 32, 8, 32 )
		// const material = new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random()*colors.length)] })
		// let mesh = new THREE.Mesh( geometry, material )
		// mesh.position.x = offset.x
		// mesh.position.y = offset.y
		// mesh.position.z = offset.z

		// simulate long async loading
		// setTimeout(() => {
		//   this.callback(mesh)
		// },2000)
	}

	async init(offset: Vector3, CHUNK_SCALE: number): Promise<any> {
		const worker = new Worker()
		const remoteFunction: any = Comlink.wrap(worker)
		await remoteFunction(
			Comlink.proxy(this.onTerrainCalculated),
			offset,
			CHUNK_SCALE
		)
	}

	onTerrainCalculated = (voxelData: any) => {
		this.voxelData = voxelData
		this.createMesh(voxelData).then((mesh) => {
			this.callback(mesh)
		})
	}

	addBlock = async (
		position: Vector3,
		type: BlockType,
		callback: (mesh: THREE.Mesh) => any
	) => {
		this.voxelData[vector3ToArrayIndex(position.x, position.y, position.z)] =
			type
		this.createMesh(this.voxelData)
	}

	removeBlock = async (position: Vector3) => {
		this.voxelData[vector3ToArrayIndex(position.x, position.y, position.z)] = 0
		this.createMesh(this.voxelData)
	}

	createMesh = async (voxelData: any): Promise<THREE.Mesh> => {
		let positions: number[] = []
		let normals: number[] = []
		let indices: number[] = []
		let uvs: number[] = []

		voxelData.forEach((type: BlockType, index: number) => {
			if (type !== 0) {
				const uvTextureOffset = type - 1 // voxel 0 is sky so for UVs we start at 0

				let thisCoords = arrayIndexToVector3(index, this.CHUNK_SCALE)

				faces.forEach((side: Side) => {
					let thisSide = faceDirs[side]

					let neighborCoords = new Vector3(
						thisCoords.x + thisSide.vec[0],
						thisCoords.y + thisSide.vec[1],
						thisCoords.z + thisSide.vec[2]
					)

					let neighbor =
						voxelData[
							vector3ToArrayIndex(
								neighborCoords.x,
								neighborCoords.y,
								neighborCoords.z,
								this.CHUNK_SCALE
							)
						]

					if (!isInBounds(neighborCoords, this.CHUNK_SCALE) || neighbor === 0) {
						const ndx = positions.length / 3
						indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3)

						for (const { pos, uv } of thisSide.corners) {
							// Positions
							positions.push(
								pos[0] + thisCoords.x,
								pos[1] + thisCoords.y,
								pos[2] + thisCoords.z
							)

							// Normals
							normals.push(
								...[thisSide.vec[0], thisSide.vec[1], thisSide.vec[2]]
							)

							// UVs

							// Special condition: Dirt has another texture
							// on it's sides when there is a neighbor above.

							let hasTopNeighbor =
								voxelData[
									vector3ToArrayIndex(
										thisCoords.x + faceDirs["top"].vec[0],
										thisCoords.y + faceDirs["top"].vec[1],
										thisCoords.z + faceDirs["top"].vec[2],
										this.CHUNK_SCALE
									)
								] !== 0

							let isBlockHorizontallSide = side !== "top" && side !== "bottom"

							if (
								type === BlockTypes.dirt &&
								hasTopNeighbor &&
								isBlockHorizontallSide
							) {
								uvs.push(
									((uvTextureOffset + uv[0]) * this.tileSize) /
										this.tileTextureWidth,
									1 -
										((faceDirs["bottom"].uvRow + 1 - uv[1]) * this.tileSize) /
											this.tileTextureHeight
								)
							} else {
								uvs.push(
									((uvTextureOffset + uv[0]) * this.tileSize) /
										this.tileTextureWidth,
									1 -
										((thisSide.uvRow + 1 - uv[1]) * this.tileSize) /
											this.tileTextureHeight
								)
							}
						}
					}
				})
			}
		})

		const geometry = this.mesh ? this.mesh.geometry : new THREE.BufferGeometry()
		const texture = new THREE.TextureLoader().load("./textures/terrain.png")
		texture.encoding = THREE.sRGBEncoding
		texture.magFilter = THREE.NearestFilter
		texture.minFilter = THREE.NearestMipmapLinearFilter

		const material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.FrontSide,
			alphaTest: 0,
			transparent: true,
		})

		const positionNumComponents = 3
		const normalNumComponents = 3
		const uvNumComponents = 2

		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(
				new Float32Array(positions),
				positionNumComponents
			)
		)
		geometry.setAttribute(
			"normal",
			new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
		)
		geometry.setAttribute(
			"uv",
			new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents)
		)
		geometry.setIndex(indices)

		this.mesh = new THREE.Mesh(geometry, material)
		this.mesh.position.x = this.offset.x
		this.mesh.position.y = this.offset.y
		this.mesh.position.z = this.offset.z

		return Promise.resolve(this.mesh)
	}
}

export default Chunk
