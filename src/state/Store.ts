import create from 'zustand'

const useStore = create(set => ({
  menuOpen: false,
  setMenuOpen: (open: boolean) => {
    console.log("menu open:", open)
    set(state => ({ 
      menuOpen: open
    }))
  },
}))

export default useStore