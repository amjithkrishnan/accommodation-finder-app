# Console Logging Configuration for React Build

## Overview
Console logs are automatically removed during production build via Terser minification.

## Maven Build Commands

### Production Build (removes console.log) - DEFAULT
```bash
mvn clean package
# or explicitly
mvn clean package -Pprod
```

### Development Build (keeps console.log)
```bash
mvn clean package -Pdev
```

## NPM Build Commands (Direct)

### Production Build (removes console.log)
```bash
cd src/main/resources/react-frontend
npm run build:prod
```

### Development Build (keeps console.log)
```bash
cd src/main/resources/react-frontend
npm run build:dev
```

### Default Build (removes console.log)
```bash
cd src/main/resources/react-frontend
npm run build
```

## Configuration

### Maven Profiles (pom.xml)
```xml
<profiles>
    <profile>
        <id>prod</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <npm.build.script>build:prod</npm.build.script>
        </properties>
    </profile>
    <profile>
        <id>dev</id>
        <properties>
            <npm.build.script>build:dev</npm.build.script>
        </properties>
    </profile>
</profiles>
```

### Build Script (build.js)
The build mode is passed as a command line argument:

```javascript
const buildMode = process.argv[2] || 'prod';
const dropConsole = buildMode === 'prod';

minify(transpiled.code, {
  compress: {
    drop_console: dropConsole  // true = remove, false = keep
  }
});
```

### Package.json Scripts
```json
"scripts": {
  "build": "node build.js",
  "build:dev": "node build.js dev",
  "build:prod": "node build.js prod"
}
```

## How It Works
- **Production (default)**: All `console.log()`, `console.info()`, `console.warn()` are removed during minification
- **Development**: Console logs are preserved for debugging
- `console.error()` is always kept (not removed by drop_console)
- Windows compatible (no environment variables needed)
