import * as THREE from 'three'
import React, { useMemo, useEffect, useRef } from 'react'
import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { Effects } from '@react-three/drei'

extend({ EffectComposer, ShaderPass, SavePass, RenderPass })

// Shader that composites the r,g,b channels of 3 textures, respectively
const triColorMix = {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    tDiffuse3: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse1;
    uniform sampler2D tDiffuse2;
    uniform sampler2D tDiffuse3;
    
    void main() {
      vec4 del0 = texture2D(tDiffuse1, vUv);
      vec4 del1 = texture2D(tDiffuse2, vUv);
      vec4 del2 = texture2D(tDiffuse3, vUv);
      float alpha = min(min(del0.a, del1.a), del2.a);
      gl_FragColor = vec4(del0.r, del1.g, del2.b, alpha);
    }
  `
}

export function ShaderEffects() {
  const composer = useRef()
  const savePass = useRef()
  const blendPass = useRef()
  const swap = useRef(false) // Whether to swap the delay buffers
  const { scene, gl, size, camera } = useThree()

  const { rtA, rtB } = useMemo(() => {
    const rtA = new THREE.WebGLRenderTarget(size.width, size.height)
    const rtB = new THREE.WebGLRenderTarget(size.width, size.height)
    return { rtA, rtB }
  }, [size])
  
  useEffect(() => {
    if ( composer.current && composer.current !== undefined) {
      // @ts-ignore
      composer.current.setSize(size.width, size.height)}
    }
  , [size])
  useFrame(() => {
    // Swap render targets and update dependencies
    let delay1 = swap.current ? rtB : rtA
    let delay2 = swap.current ? rtA : rtB
    if ( blendPass.current && blendPass.current !== undefined) {
      // @ts-ignore
      savePass.current.renderTarget = delay2
      // @ts-ignore
      blendPass.current.uniforms['tDiffuse2'].value = delay1.texture
      // @ts-ignore
      blendPass.current.uniforms['tDiffuse3'].value = delay2.texture
      swap.current = !swap.current
      if ( composer.current && composer.current !== undefined) {
        // @ts-ignore
        composer.current.render()
      }
    }
  }, 1)

  return (
    // @ts-ignore
    <Effects multisamping={8} renderIndex={1} disableGamma={false} disableRenderPass={false} > <renderPass attachArray="passes" scene={scene} camera={camera} /><shaderPass attachArray="passes" ref={blendPass} args={[triColorMix, 'tDiffuse1']} needsSwap={false} /><savePass attachArray="passes" ref={savePass} needsSwap={true} />
      <shaderPass attachArray="passes" args={[CopyShader]} />
    </Effects>
  )
}
