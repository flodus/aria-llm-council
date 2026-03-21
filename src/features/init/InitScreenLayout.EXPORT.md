# InitScreenLayout — Export

## Code complet

```jsx
// src/features/init/InitScreenLayout.jsx
export default function InitScreenLayout({ children, background }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {background && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {background}
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
```

## Props

| Prop         | Type        | Obligatoire | Description |
|--------------|-------------|-------------|-------------|
| `children`   | `ReactNode` | Oui         | Contenu principal affiché au-dessus du fond |
| `background` | `ReactNode` | Non         | Fond décoratif positionné en absolu derrière le contenu (`zIndex: 0`, `pointerEvents: none`) |

## Comportement

- Le conteneur racine : `position: relative`, `width: 100%`, `height: 100%`, `overflow: hidden`
- Si `background` est fourni : rendu dans une div `position: absolute, inset: 0, zIndex: 0, pointerEvents: none`
- `children` : rendu dans une div `position: relative, zIndex: 1` — toujours au-dessus du fond

## Exemple d'usage avec `background`

```jsx
import InitScreenLayout from './InitScreenLayout';
import PlanetCanvas from '../canvas/PlanetCanvas';

function MaPlaneteInitScreen() {
  return (
    <InitScreenLayout background={<PlanetCanvas />}>
      <InitScreen
        worldName={worldName}
        setWorldName={setWorldName}
        onLaunchLocal={handleLaunchLocal}
        onLaunchAI={handleLaunchAI}
        hasApiKeys={hasApiKeys}
        onRefreshKeys={refreshKeys}
      />
    </InitScreenLayout>
  );
}
```

> Note : `InitScreen` est déjà enveloppé dans `InitScreenLayout` par défaut.
> Pour usage dans `ma-planete`, importer `InitScreenInner` directement et l'envelopper
> dans un `InitScreenLayout` personnalisé avec le fond 3D souhaité.
