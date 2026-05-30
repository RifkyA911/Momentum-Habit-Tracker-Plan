import { watch, ref } from 'vue'

// Use a module-level ref to share state across components
const themeHex = ref('#f97316')

export const useTheme = () => {
  // Load from localStorage on first call
  if (typeof window !== 'undefined' && themeHex.value === '#f97316') {
    try {
      const stored = localStorage.getItem('theme-hex')
      if (stored) {
        themeHex.value = stored
        console.log('Theme loaded from localStorage:', stored)
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage:', e)
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 249, g: 115, b: 22 }
  }

  // Simple shade generator using color mixing
  const updateCSSVariables = (hex: string) => {
    if (typeof document === 'undefined') return
    
    const rgb = hexToRgb(hex)
    const root = document.documentElement
    
    // Base color is roughly the 500 shade
    root.style.setProperty('--color-primary-500', `${hex}`)
    
    // We can use a simple interpolation for other shades if needed, or just let Tailwind v4 color-mix handle it if we define them.
    // For a robust implementation, we define the RGB values for Tailwind v3 opacity support, or just the hex for v4.
    // Since Nuxt UI uses these classes: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
    
    // A quick hack for shades: mix with white for lighter, black for darker
    const mix = (c1: {r:number,g:number,b:number}, c2: {r:number,g:number,b:number}, weight: number) => {
      const w = weight / 100
      return `rgb(${Math.round(c1.r * w + c2.r * (1 - w))}, ${Math.round(c1.g * w + c2.g * (1 - w))}, ${Math.round(c1.b * w + c2.b * (1 - w))})`
    }
    
    const white = { r: 255, g: 255, b: 255 }
    const black = { r: 0, g: 0, b: 0 }
    
    root.style.setProperty('--color-primary-50', mix(rgb, white, 10))
    root.style.setProperty('--color-primary-100', mix(rgb, white, 20))
    root.style.setProperty('--color-primary-200', mix(rgb, white, 40))
    root.style.setProperty('--color-primary-300', mix(rgb, white, 60))
    root.style.setProperty('--color-primary-400', mix(rgb, white, 80))
    root.style.setProperty('--color-primary-600', mix(rgb, black, 80))
    root.style.setProperty('--color-primary-700', mix(rgb, black, 60))
    root.style.setProperty('--color-primary-800', mix(rgb, black, 40))
    root.style.setProperty('--color-primary-900', mix(rgb, black, 20))
    root.style.setProperty('--color-primary-950', mix(rgb, black, 10))
  }

  // Watch for changes and update
  watch(themeHex, (newHex) => {
    if (newHex) {
      updateCSSVariables(newHex)
      // Save to localStorage
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme-hex', newHex)
          console.log('Theme saved to localStorage:', newHex)
        }
      } catch (e) {
        console.error('Failed to save theme to localStorage:', e)
      }
    }
  }, { immediate: true })

  return { themeHex }
}
