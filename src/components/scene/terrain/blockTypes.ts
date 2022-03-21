export enum BlockTypes {
	dirt = 1,
	rock = 2,
}

export type BlockType = 0 | BlockTypes.dirt | BlockTypes.rock

export type Side = "left" | "right" | "bottom" | "top" | "back" | "front"

export const faces: Side[] = ["left", "right", "bottom", "top", "back", "front"]

export const faceDirs = {
	left: {
		uvRow: 0,
		vec: [-1, 0, 0],
		corners: [
			{ pos: [0, 1, 0], uv: [0, 1] },
			{ pos: [0, 0, 0], uv: [0, 0] },
			{ pos: [0, 1, 1], uv: [1, 1] },
			{ pos: [0, 0, 1], uv: [1, 0] },
		],
	},
	right: {
		uvRow: 0,
		vec: [1, 0, 0],
		corners: [
			{ pos: [1, 1, 1], uv: [0, 1] },
			{ pos: [1, 0, 1], uv: [0, 0] },
			{ pos: [1, 1, 0], uv: [1, 1] },
			{ pos: [1, 0, 0], uv: [1, 0] },
		],
	},
	bottom: {
		uvRow: 1,
		vec: [0, -1, 0],
		corners: [
			{ pos: [1, 0, 1], uv: [1, 0] },
			{ pos: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, 0, 0], uv: [1, 1] },
			{ pos: [0, 0, 0], uv: [0, 1] },
		],
	},
	top: {
		uvRow: 2,
		vec: [0, 1, 0],
		corners: [
			{ pos: [0, 1, 1], uv: [1, 1] },
			{ pos: [1, 1, 1], uv: [0, 1] },
			{ pos: [0, 1, 0], uv: [1, 0] },
			{ pos: [1, 1, 0], uv: [0, 0] },
		],
	},
	back: {
		uvRow: 0,
		vec: [0, 0, -1],
		corners: [
			{ pos: [1, 0, 0], uv: [0, 0] },
			{ pos: [0, 0, 0], uv: [1, 0] },
			{ pos: [1, 1, 0], uv: [0, 1] },
			{ pos: [0, 1, 0], uv: [1, 1] },
		],
	},
	front: {
		uvRow: 0,
		vec: [0, 0, 1],
		corners: [
			{ pos: [0, 0, 1], uv: [0, 0] },
			{ pos: [1, 0, 1], uv: [1, 0] },
			{ pos: [0, 1, 1], uv: [0, 1] },
			{ pos: [1, 1, 1], uv: [1, 1] },
		],
	},
}
