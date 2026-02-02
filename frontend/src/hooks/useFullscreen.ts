import { useState, useCallback, useEffect } from 'react'

// Check if currently in fullscreen (cross-browser)
function checkFullscreenState(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

export function useFullscreen(elementRef?: React.RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const checkFullscreen = useCallback(() => {
    const isFS = checkFullscreenState()
    setIsFullscreen(isFS)
    return isFS
  }, [])

  const enterFullscreen = useCallback(async () => {
    const element = elementRef?.current || document.documentElement

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        // Safari/older Chrome/Smart TV browsers
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        // Firefox
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        // IE/Edge
        await (element as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
      return true
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
      return false
    }
  }, [elementRef])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
      return true
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
      return false
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      return exitFullscreen()
    } else {
      return enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(checkFullscreenState())
    }

    // Cross-browser fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Initial check
    checkFullscreen()

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [checkFullscreen])

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    checkFullscreen,
  }
}
