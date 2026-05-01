# Composants UI - TERMINATOR

Cette bibliothèque de composants fournit une interface utilisateur cohérente et réutilisable pour l'application TERMINATOR.

## Charte graphique

- **Couleurs principales** : `#1e3a5f` (bleu foncé), `#E0E6EF` (gris clair)
- **Transitions** : 200ms pour tous les effets hover
- **Border radius** : `rounded-md` (6px) par défaut
- **Focus** : Anneau bleu `#1e3a5f` avec offset

## Composants disponibles

### Button
Bouton polyvalent avec plusieurs variantes et tailles.

```tsx
import { Button } from '../components';

// Bouton primaire
<Button variant="primary" size="md" onClick={handleClick}>
  Créer un projet
</Button>

// Avec icône
<Button variant="secondary" icon="plus" iconPosition="left">
  Ajouter
</Button>

// Bouton de chargement
<Button loading={isLoading}>
  Sauvegarder
</Button>
```

**Props** : `variant`, `size`, `icon`, `iconPosition`, `fullWidth`, `loading`

### IconButton
Bouton avec icône seulement, idéal pour les actions contextuelles.

```tsx
import { IconButton } from '../components';

<IconButton
  icon="edit"
  variant="ghost"
  size="sm"
  tooltip="Modifier"
  onClick={handleEdit}
/>
```

**Props** : `variant`, `size`, `icon`, `tooltip`, `loading`

### InputText
Champ de saisie texte avec validation et icônes.

```tsx
import { InputText } from '../components';

<InputText
  label="Nom du projet"
  placeholder="Entrez le nom..."
  icon="project"
  error={errors.name}
  helperText="Maximum 50 caractères"
/>
```

**Props** : `size`, `icon`, `iconPosition`, `error`, `helperText`, `fullWidth`, `label`

### Modal
Fenêtre modale pour les dialogues et formulaires.

```tsx
import { Modal, ModalFooter, Button } from '../components';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Nouveau projet"
  size="md"
>
  <form>
    {/* Contenu du formulaire */}
  </form>

  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Annuler
    </Button>
    <Button variant="primary" type="submit">
      Créer
    </Button>
  </ModalFooter>
</Modal>
```

**Props** : `isOpen`, `onClose`, `title`, `size`, `showCloseButton`, `closeOnOverlayClick`

### Card
Conteneur pour grouper du contenu.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '../components';

<Card hover>
  <CardHeader>
    <h3>Titre de la carte</h3>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props** : `padding`, `shadow`, `border`, `hover`

### Badge
Petit indicateur pour les statuts et labels.

```tsx
import { Badge } from '../components';

<Badge variant="success" size="sm">
  Terminé
</Badge>
```

**Props** : `variant`, `size`, `rounded`

### Select
Liste déroulante avec options.

```tsx
import { Select } from '../components';

<Select
  label="Phase du projet"
  placeholder="Sélectionnez une phase"
  options={[
    { value: 'demarrage', label: 'Démarrage' },
    { value: 'planification', label: 'Planification' },
    { value: 'execution', label: 'Exécution' }
  ]}
  value={selectedPhase}
  onChange={(e) => setSelectedPhase(e.target.value)}
/>
```

**Props** : `size`, `options`, `placeholder`, `error`, `helperText`, `fullWidth`, `label`

### Loading & Spinner
Indicateurs de chargement.

```tsx
import { Loading, Spinner } from '../components';

// Spinner simple
<Spinner size="md" />

// Indicateur de chargement avec message
<Loading message="Chargement des projets..." fullScreen />
```

**Props** : `size`, `color`, `message`, `fullScreen`

### Alert
Notifications et messages d'alerte.

```tsx
import { Alert } from '../components';

<Alert
  variant="success"
  title="Projet créé"
  message="Le projet a été créé avec succès."
  dismissible
  onDismiss={() => setShowAlert(false)}
/>
```

**Props** : `variant`, `title`, `message`, `icon`, `dismissible`, `onDismiss`

## Utilisation dans le projet

Tous les composants sont exportés depuis `../components` :

```tsx
import {
  Button,
  IconButton,
  InputText,
  Modal,
  Card,
  Badge,
  Select,
  Loading,
  Alert
} from '../components';
```

## Accessibilité

Tous les composants respectent les standards d'accessibilité :
- Focus visible avec anneau
- Labels appropriés
- Rôles ARIA
- Navigation au clavier
- Contraste des couleurs

## Personnalisation

Les composants utilisent Tailwind CSS et peuvent être personnalisés via la prop `className` pour des cas spécifiques.