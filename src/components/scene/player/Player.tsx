import React, { useRef, useState, useContext, useEffect } from 'react'
import * as THREE from 'three';
import { Vector3 } from 'three';
import { useFrame } from '@react-three/fiber'

import { StoreContext } from '../../../state/Context'

function Box(props: JSX.IntrinsicElements['mesh']) {
  
  const mesh = useRef<THREE.Mesh>(null!)

  const [faceDir, setFaceDir] = useState(new Vector3(0,0,1))
  
  const { dispatch } = useContext(StoreContext);
  
  useFrame((state, delta) => {

    let newFaceDir = new Vector3(
      faceDir.x,
      faceDir.y + 0.01,
      faceDir.z
    )
    
    let rotYDeg = THREE.MathUtils.radToDeg(newFaceDir.y)

    // FIXME rotYDeg never reaches EXACTLY 360. However, switching to
    // ">" operator causes strange jumping behavior

    if ( rotYDeg === 360 ) {
      newFaceDir = new Vector3(newFaceDir.x, 0, newFaceDir.z)
    }
    
    setFaceDir(newFaceDir)
    
    mesh.current.rotation.x = newFaceDir.x
    mesh.current.rotation.y = newFaceDir.y
    mesh.current.rotation.z = newFaceDir.z
    
    // FIXME At steps where rotation !== 0, 90, 180, 270 the state gets dispatched twice

    if ( Math.floor(rotYDeg) % 45 === 0 ) {
      // dispatch({ type: 'UPDATE_PLAYER_DIRECTION', payload:  Math.floor(rotYDeg) })
    }

  })
  
  return (
    <mesh
      {...props}
      ref={mesh}
      rotation={[90 * Math.PI / 180, 0, 0]}
      >
      <coneGeometry args={[5, 20, 4]} />
      <meshBasicMaterial color={"hotpink"} />
    </mesh>
  )
}

interface PlayerProps {
  readonly initialPos?: Vector3
}

const Player: React.FC<PlayerProps> = ({ initialPos = new Vector3(0,0,0) }) => {
  return (    
    <Box position={[0, 64, 0]} />
  )
}

export default Player