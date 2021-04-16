import React, { createContext, useReducer } from 'react';
import { reducer } from './Reducer'

import { Vector3 } from 'three';

type InitialStateType = {
  playerFaceDir: number;
}

const initialState = {
  playerFaceDir: 0
}

const StoreContext = createContext<{ state: InitialStateType; dispatch: React.Dispatch<any> }>({
  state: initialState as InitialStateType,
  dispatch: () => {}
});

const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{state, dispatch}}>
      {children}
    </StoreContext.Provider>
  )
}

export { StoreContext, AppProvider };