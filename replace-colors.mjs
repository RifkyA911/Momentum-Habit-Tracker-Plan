import fs from 'fs'
import path from 'path'

const dirsToSearch = ['app/pages', 'app/layouts', 'app/components']

const replaceColorsInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  // We want to replace text-emerald-*, bg-emerald-*, etc. with primary
  // Also orange and blue
  const newContent = content
    .replace(/\b(text|bg|border|ring|focus:border|focus:ring|shadow|from|to|via)-(orange|emerald|blue)-/g, '$1-primary-')
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8')
    console.log(`Updated ${filePath}`)
  }
}

const walkDir = (dir) => {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath)
    } else if (fullPath.endsWith('.vue')) {
      replaceColorsInFile(fullPath)
    }
  }
}

dirsToSearch.forEach(walkDir)
