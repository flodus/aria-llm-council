florian@bazzite:~$ pwd
/home/florian
florian@bazzite:~$ tree -I 'node_modules|cache|test_*' ma-planete/
ma-planete/
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── public
│   ├── countries.geo.json
│   ├── favicon.svg
│   ├── FRA.geo.json
│   ├── icons.svg
│   └── world.geo.json-master.zip
├── README.md
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components
│   │   └── canvas
│   │       ├── Marker.jsx
│   │       ├── Planet_geojson.jsx
│   │       ├── Planet.jsx
│   │       ├── Planet-shaderProcedural.jsx
│   │       ├── Scene.jsx
│   │       └── WarRoomMap.jsx
│   ├── index.css
│   ├── main.jsx
│   └── utils
│       └── geoMaths.js
└── vite.config.js

7 directories, 25 files
florian@bazzite:~$ 
