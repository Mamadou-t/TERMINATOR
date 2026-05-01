# Icon Component

Le composant `Icon` est un système d'icônes unifié et réutilisable pour l'application TERMINATOR.

## Utilisation de base

```tsx
import { Icon } from '../components';

// Icône simple
<Icon name="dashboard" />

// Avec taille personnalisée
<Icon name="project" size="lg" />

// Avec couleur personnalisée
<Icon name="check" color="#10B981" />

// Avec classes CSS supplémentaires
<Icon name="edit" className="hover:scale-110" />

// Avec gestionnaire de clic
<Icon name="plus" onClick={() => console.log('Ajouter')} />
```

## Props disponibles

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `name` | `IconName` | **requis** | Nom de l'icône à afficher |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Taille de l'icône |
| `color` | `string` | `'currentColor'` | Couleur de l'icône (CSS color) |
| `className` | `string` | `''` | Classes CSS supplémentaires |
| `onClick` | `() => void` | `undefined` | Fonction appelée au clic |

## Icônes disponibles

### Navigation & Dashboard
- `dashboard` - Tableau de bord
- `portfolio` - Portefeuille
- `home` - Accueil
- `menu` - Menu hamburger
- `settings` - Paramètres

### Projets & Phases
- `project` - Projet
- `folder` - Dossier fermé
- `folder-open` - Dossier ouvert
- `chevron-right` - Chevron droite
- `chevron-down` - Chevron bas
- `chevron-left` - Chevron gauche
- `chevron-up` - Chevron haut

### Actions
- `plus` - Ajouter
- `minus` - Soustraire
- `edit` - Modifier
- `delete` - Supprimer
- `save` - Sauvegarder
- `cancel` - Annuler
- `search` - Rechercher
- `filter` - Filtrer

### États & Statuts
- `check` - Coche
- `check-circle` - Coche dans un cercle
- `x` - Croix
- `x-circle` - Croix dans un cercle
- `alert` - Alerte
- `info` - Information
- `warning` - Avertissement
- `success` - Succès

### Utilisateurs & Équipes
- `user` - Utilisateur
- `users` - Utilisateurs
- `user-plus` - Ajouter utilisateur
- `user-minus` - Retirer utilisateur

### Temps & Calendrier
- `calendar` - Calendrier
- `clock` - Horloge
- `timer` - Minuteur

### Fichiers & Documents
- `file` - Fichier
- `file-text` - Fichier texte
- `download` - Télécharger
- `upload` - Téléverser

### Communication
- `mail` - Email
- `message` - Message
- `phone` - Téléphone

### Éléments UI
- `eye` - Œil (visible)
- `eye-off` - Œil barré (caché)
- `star` - Étoile
- `star-filled` - Étoile remplie
- `heart` - Cœur
- `heart-filled` - Cœur rempli

## Tailles disponibles

| Taille | Classe CSS | Dimensions |
|--------|------------|------------|
| `xs` | `w-3 h-3` | 12px × 12px |
| `sm` | `w-4 h-4` | 16px × 16px |
| `md` | `w-5 h-5` | 20px × 20px |
| `lg` | `w-6 h-6` | 24px × 24px |
| `xl` | `w-8 h-8` | 32px × 32px |
| `2xl` | `w-10 h-10` | 40px × 40px |

## Exemples d'utilisation

### Dans le Layout (sidebar)
```tsx
// Icône de navigation
<Icon name="dashboard" className="mr-2 text-[#ffffff60] group-hover:text-white" size="sm" />

// Chevron d'expansion
<Icon name="chevron-right" className="transform rotate-90" size="sm" />

// Indicateur de sous-phase
<Icon name="check" className="mr-2" size="xs" />
```

### Dans les boutons d'action
```tsx
<button className="flex items-center gap-2">
  <Icon name="plus" size="sm" />
  Ajouter un projet
</button>

<button className="flex items-center gap-2">
  <Icon name="edit" size="sm" />
  Modifier
</button>
```

### Dans les statuts
```tsx
<div className="flex items-center gap-2">
  <Icon name="check-circle" color="#10B981" size="sm" />
  <span>Terminé</span>
</div>

<div className="flex items-center gap-2">
  <Icon name="warning" color="#F59E0B" size="sm" />
  <span>En attente</span>
</div>
```

## Avantages

- ✅ **Cohérence** : Toutes les icônes utilisent le même système
- ✅ **Performance** : Pas de dépendance externe aux bibliothèques d'icônes
- ✅ **Personnalisation** : Couleurs, tailles et styles facilement modifiables
- ✅ **TypeScript** : Typage complet pour éviter les erreurs
- ✅ **Maintenabilité** : Ajout d'icônes centralisé dans un seul fichier
- ✅ **Accessibilité** : Icônes SVG scalables et lisibles par les lecteurs d'écran

## Ajouter une nouvelle icône

1. Ajouter le nom dans le type `IconName`
2. Ajouter le path SVG dans l'objet `iconPaths`
3. Utiliser l'icône dans vos composants

```tsx
// Dans Icon.tsx
export type IconName = ... | 'new-icon';

const iconPaths: Record<IconName, string> = {
  ...,
  'new-icon': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
};
```