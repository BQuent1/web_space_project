# WWD - Will We Die

> A TresJS Vue application

WWD est un projet de carte 3D interactive du système soleil-terre-lune en temps réel. Développé en Vue, il permet d'interroger une API de la NASA (NeoWs) permettant de récupèrer la liste des astéroïdes passant les plus proches de la Terre ainsi que leurs données associées (vitesse, distance, taille, etc.)

J'interroge ensuite pour chaque astéroïde une autre application fournie par la NASA (JPL Horizons system) permettant de récupérer les orbites et les directions des roches.
Vous pouvez alors filtrer les astéroïdes reçu, cliquer dessus pour afficher leurs détails et même prévoir les prochaines approches en choisissant la date.

Bref amusez vous en voyageant à 60 000 000 km de la Terre et appelez moi si jamais il y en a un qui s'approche un peu trop ☄️


## Features

- [Tres.js](https://tresjs.org) and latest [Three.js](https://threejs.org)
- `@tresjs/cientos` package pre-installed 📦
- `@tresjs/leches` GUI controls for debugging 🍰
- Shader support (glsl) with [`vite-plugin-glsl`](https://github.com/UstymUkhman/vite-plugin-glsl) 🎨
- TypeScript support 🦄
- ESLint configuration 🔧

## Getting Started

### Install dependencies

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build the application for production:

```bash
npm run build
```

### Preview

Locally preview production build:

```bash
npm run preview
```

### Lint

Run ESLint:

```bash
npm run lint
```

Fix ESLint issues:

```bash
npm run lint:fix
```

## Learn More

- [TresJS Documentation](https://tresjs.org)
- [Three.js Documentation](https://threejs.org/docs/)
- [Vue.js Documentation](https://vuejs.org/)