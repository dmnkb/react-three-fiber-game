import React, { useEffect, useContext } from 'react';
// import { StoreContext } from '../../state/Context'
import { useThree } from '@react-three/fiber'
import useStore from '../../state/Store'

import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  DialogContent,
  Button
} from '@material-ui/core'

const DemoUI = () => {

  const menuOpen = useStore(state => state.menuOpen) as boolean
  const setMenuOpen: any = useStore(state => state.setMenuOpen)

  useEffect(() => {
    document.addEventListener("keydown", (data) => {
      if (data.key === "Escape") { 
        setMenuOpen(true)
      }
    })
  }, []);

  return (
    <Dialog 
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      aria-labelledby="alert-dialog-title"
      >
      <DialogTitle disableTypography id="alert-dialog-title">
        <Typography variant="subtitle1">Compare products</Typography>
        <IconButton 
          aria-label="close"
          color="primary"
          onClick={() => setMenuOpen(false)}>
          {/* <CloseIcon />  */}Close
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        
      </DialogContent>       
    </Dialog>
  )

}

export default DemoUI