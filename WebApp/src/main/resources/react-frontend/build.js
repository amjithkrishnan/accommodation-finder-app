const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const babel = require('@babel/core');

const buildMode = process.argv[2] || 'prod';
const dropConsole = buildMode === 'prod';

const buildDir = path.join(__dirname, 'build');

// Clean and create build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true, force: true });
}
fs.mkdirSync(buildDir, { recursive: true });

// Files in order
const files = [
  'components/Router.js',
  'components/LoadingContext.js',
  'services/authService.js',
  'services/propertyService.js',
  'services/mediaService.js',
  'services/masterDataService.js',
  'context/AuthContext.js',
  'components/ConfirmModal.js',
  'components/Breadcrumb.js',
  'components/Header.js',
  'components/Footer.js',
  'components/PropertyDetails.js',
  'components/AccommodationList.js',
  'components/SignIn.js',
  'components/SignUp.js',
  'components/Dashboard.js',
  'components/AddProperty.js',
  'components/Profile.js',
  'components/App.js'
];

// Concatenate all JS files
let concatenated = '';
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    concatenated += fs.readFileSync(filePath, 'utf8') + '\n';
  }
});

// Add render code
concatenated += `
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(AuthProvider, null,
    React.createElement(App)
  )
);
`;

// Transpile JSX to plain JavaScript
const transpiled = babel.transformSync(concatenated, {
  presets: [['@babel/preset-react', { pragma: 'React.createElement' }]]
});

// Minify
minify(transpiled.code, {
  compress: {
    drop_console: dropConsole,
    drop_debugger: true
  },
  mangle: true,
  output: {
    comments: false
  },
  sourceMap: false
}).then(result => {
  // Write minified bundle
  const hash = Date.now().toString(36);
  const bundleName = `main.${hash}.js`;
  fs.writeFileSync(path.join(buildDir, bundleName), result.code);

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AccommodateMe - Find Your Perfect Home in Ireland</title>
    <link rel="preconnect" href="https://unpkg.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="theme.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    <script src="config.js"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js" defer></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" defer></script>
    <script src="https://unpkg.com/axios@1.6.2/dist/axios.min.js" defer></script>
    <script src="https://unpkg.com/@mui/material@5.14.20/umd/material-ui.production.min.js" defer></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
        body { font-family: 'Roboto', 'Segoe UI', sans-serif; margin: 0; }
        html, body, #root { height: 100%; }
        input { user-select: text; }
        .gradient-bg { 
            background: linear-gradient(135deg, rgba(45, 80, 22, 0.85) 0%, rgba(74, 124, 44, 0.85) 25%, rgba(107, 157, 62, 0.85) 50%, rgba(212, 175, 55, 0.85) 75%, rgba(244, 208, 63, 0.85) 100%), url('app-bg.png');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .get-started { text-align: center; position: relative; min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .get-started h1 { color: white; font-size: 3em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .get-started p { color: white; font-size: 1.2em; margin-bottom: 40px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
        #root { display: flex; flex-direction: column; min-height: 100vh; }
        #loader { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #169B62; font-size: 1.2rem; }
    </style>
</head>
<body>
    <div id="root"><div id="loader">Loading...</div></div>
    <script src="${bundleName}" defer></script>
</body>
</html>`;

  fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtml);

  // Copy static assets
  fs.copyFileSync('app-bg.png', path.join(buildDir, 'app-bg.png'));
  fs.copyFileSync('theme.css', path.join(buildDir, 'theme.css'));
  fs.copyFileSync('config.js', path.join(buildDir, 'config.js'));

  console.log(`Build complete! Bundle: ${bundleName}`);
  console.log(`Mode: ${buildMode} (drop_console: ${dropConsole})`);
  console.log(`Size: ${(result.code.length / 1024).toFixed(2)} KB`);
}).catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
