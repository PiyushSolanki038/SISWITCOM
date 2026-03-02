
$dest = "marketing-frontend-only"

# Create directories (already done partly but ensuring)
New-Item -ItemType Directory -Force -Path "$dest/src/components"
New-Item -ItemType Directory -Force -Path "$dest/src/lib"
New-Item -ItemType Directory -Force -Path "$dest/src/hooks"
New-Item -ItemType Directory -Force -Path "$dest/src/context"
New-Item -ItemType Directory -Force -Path "$dest/src/config"
New-Item -ItemType Directory -Force -Path "$dest/src/pages/marketing"
New-Item -ItemType Directory -Force -Path "$dest/src/pages/auth"
New-Item -ItemType Directory -Force -Path "$dest/src/components/layout"
New-Item -ItemType Directory -Force -Path "$dest/src/components/common"

# Copy directories
Copy-Item -Path "src/components/ui" -Destination "$dest/src/components" -Recurse -Force
Copy-Item -Path "src/lib" -Destination "$dest/src" -Recurse -Force
Copy-Item -Path "src/hooks" -Destination "$dest/src" -Recurse -Force
Copy-Item -Path "src/context" -Destination "$dest/src" -Recurse -Force
Copy-Item -Path "src/config" -Destination "$dest/src" -Recurse -Force
Copy-Item -Path "public" -Destination "$dest" -Recurse -Force

# Copy specific files
Copy-Item -Path "src/features/marketing/pages/*" -Destination "$dest/src/pages/marketing" -Force
Copy-Item -Path "src/features/auth/pages/*" -Destination "$dest/src/pages/auth" -Force
Copy-Item -Path "src/components/layout/MarketingLayout.tsx" -Destination "$dest/src/components/layout" -Force
Copy-Item -Path "src/components/layout/Header.tsx" -Destination "$dest/src/components/layout" -Force
Copy-Item -Path "src/components/layout/Sidebar.tsx" -Destination "$dest/src/components/layout" -Force
Copy-Item -Path "src/components/common/NotificationBell.tsx" -Destination "$dest/src/components/common" -Force
Copy-Item -Path "src/index.css" -Destination "$dest/src" -Force

# Copy config files
Copy-Item "package.json" -Destination "$dest" -Force
Copy-Item "tsconfig.json" -Destination "$dest" -Force
Copy-Item "vite.config.ts" -Destination "$dest" -Force
if (Test-Path "postcss.config.js") { Copy-Item "postcss.config.js" -Destination "$dest" -Force }
if (Test-Path "tailwind.config.js") { Copy-Item "tailwind.config.js" -Destination "$dest" -Force }
if (Test-Path "eslint.config.js") { Copy-Item "eslint.config.js" -Destination "$dest" -Force }

Write-Host "Copy complete"
