export const reducer = (state: any, action: any) => {
  switch (action.type) {
    case "UPDATE_PLAYER_DIRECTION":
      return {
        ...state,
        playerFaceDir: action.payload
      }
    default:
      return state
  }
}