import React from 'react'
import * as THREE from 'three';
import { Vector3 } from 'three';


interface PlayerProps {
  readonly initialPos?: Vector3
}

const Player: React.FC<PlayerProps> = ({initialPos = new Vector3(0,0,0)}) => {
  
  return (
    <></>
  )

}

export default Player