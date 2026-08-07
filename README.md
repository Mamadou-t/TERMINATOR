# Terminator — Backend Django

Outil de gestion de projet BTP basé sur le référentiel PMI/PMBOK
(5 phases, 10 domaines de connaissance, ~49 processus).

## Stack

- **Django 6** + **Django REST Framework** (API REST)
- **SimpleJWT** pour l'authentification par token
- **django-cors-headers** pour autoriser un frontend séparé
- **django-filter** pour le filtrage/tri des endpoints
- **PostgreSQL** en dev ET en prod (SQLite reste disponible en secours via `USE_POSTGRES=False`)

## Structure du projet

```
terminator-backend/
├── config/                 # settings, urls, wsgi/asgi
├── apps/
│   ├── core/                # modèle abstrait BaseModel (id UUID, dates)
│   ├── projets/              # entité PROJET
│   ├── charte/                # entité CHARTE (Charte de Projet)
│   ├── perimetre/             # entité PERIMETRE
│   ├── wbs/                   # entité WBS
│   ├── risques/               # entité RISQUE
│   ├── couts/                 # entité COUTS
│   ├── parties_prenantes/     # entité PARTIE_PRENANTE
│   ├── activites/             # entité ACTIVITES
│   ├── ressources/            # entité RESSOURCES
│   └── approvisionnement/     # entité APPROVISIONNEMENT
├── manage.py
├── requirements.txt
└── .env.example
```

Chaque app suit le même squelette : `models.py`, `serializers.py`
(ModelSerializer), `views.py` (ModelViewSet), `urls.py` (DefaultRouter),
`admin.py`.

## Mapping MLD → Django

Les modèles reflètent maintenant le MLD que tu as fourni (image du 02/07).

**Entités** (une par app, héritent de `apps.core.BaseModel` : `id` UUID,
`cree_le`, `modifie_le`) :

| Entité MLD | App / modèle | Relations |
|---|---|---|
| PROJET | `projets.Projet` | `projet_parent` (récursif, lots/sous-projets), `charte` (1-1), `perimetre` (1-1), `wbs_racine` (1-1) |
| CHARTE | `charte.Charte` | référencée par PROJET |
| PERIMETRE | `perimetre.Perimetre` | référencée par PROJET |
| WBS | `wbs.WBS` | `wbs_parent` (récursif, arborescence) |
| RISQUE | `risques.Risque` | `wbs` (N:1) |
| ACTIVITES | `activites.Activite` | `wbs` (N:1), `cout` (N:1) |
| COUTS | `couts.Cout` | référencée par ACTIVITES |
| LIVRABLES | `livrables.Livrable` | `projet` (N:1) — app créée, entité confirmée par ce MLD |
| PARTIE_PRENANTE | `parties_prenantes.PartiePrenante` | liée via IMPLIQUER et PARTICIER |
| RESSOURCES (`quantite_disponible`) | `ressources.Ressource` | `activite` (N:1) |
| APPROVISIONNEMENT | `approvisionnement.Approvisionnement` | liée via SUBIR |

**Associations devenues tables** (jointures pures, sans attribut propre) :

| Association | Entités liées | Modèle |
|---|---|---|
| SUBIR | PROJET ↔ APPROVISIONNEMENT | `approvisionnement.Subir`, exposée sur `Projet.approvisionnements` |
| IMPLIQUER | PROJET ↔ PARTIE_PRENANTE | `parties_prenantes.Impliquer`, exposée sur `Projet.parties_prenantes` |
| PARTICIER | PARTIE_PRENANTE ↔ ACTIVITES | `parties_prenantes.Particier`, exposée sur `PartiePrenante.activites` |

Chacune est routée en API à part pour créer/lister le lien lui-même :
`POST /api/v1/approvisionnements/subir/`,
`POST /api/v1/parties-prenantes/impliquer/`,
`POST /api/v1/parties-prenantes/particier/`
(en plus d'apparaître automatiquement dans la fiche projet/partie prenante via le champ M2M).

### Choix technique important : pas de clé primaire composite

Ton MLD montre ces 3 tables avec une clé primaire composite (les deux FK,
rien d'autre). Django 6 a bien un champ `CompositePrimaryKey`, mais il ne
supporte pas les dépendances circulaires entre apps — et ici PROJET
dépend d'APPROVISIONNEMENT (et PARTIE_PRENANTE) via ces mêmes tables, donc
la migration plante. J'ai donc gardé un `id` technique auto-incrémenté sur
ces 3 tables, avec une **contrainte d'unicité** sur le couple de FK qui
reproduit exactement la même règle d'intégrité (impossible d'avoir deux
fois le même couple). C'est un détail d'implémentation, pas un changement
de structure : le comportement métier est identique à ce que montre le MLD.

### Hypothèses posées (à valider avec toi)

- `PROJET.charte`, `.perimetre`, `.wbs_racine` : modélisées en **1-1**
  (un projet a exactement une charte / un périmètre / une racine WBS).
  À confirmer si un projet peut en changer ou en avoir plusieurs.
- `PROJET.projet_parent` (association récursive `id_projet_1`) : interprétée
  comme hiérarchie **projet parent / sous-projets (lots)**, en écho aux
  fichiers "betalot 2". `on_delete=SET_NULL` (suppression du parent ne
  supprime pas les lots) — à confirmer.
- `WBS.wbs_parent` : hiérarchie standard de décomposition, `on_delete=CASCADE`
  (supprimer un nœud supprime ses enfants) — à confirmer.
- La table `quantite_disponible` du MLD a été rattachée à l'app `ressources`
  déjà créée (le contenu correspond à l'entité RESSOURCES). À confirmer si
  ce sont bien la même entité.
- `particier` est probablement une coquille pour "participer" — gardé tel
  quel (nom de table et de modèle) en attendant confirmation ; facile à
  renommer si besoin.
- Tous les champs `statut_*`, `type_*`, `categorie_*`, `role`, `pouvoir`,
  `interet` sont en `CharField` libre avec un `TODO` en commentaire : les
  valeurs d'énumération exactes ne sont pas encore définies.
- `devise` (dans COUTS) n'a pas de valeur par défaut : XOF pressenti mais
  pas fixé en dur.

**Prochaine étape suggérée :** trancher les points ci-dessus (surtout les
énums métier BTP), puis je génère les `choices=` Django correspondants et
j'affine les `on_delete` si besoin.

## Installation (à partir de zéro)

Le projet utilise PostgreSQL en dev comme en prod. Deux options pour
l'avoir en local — choisis celle qui te convient, tu n'as besoin que
d'UNE des deux :

### Option A — Docker (recommandé, aucune installation de PostgreSQL requise)

Il te faut juste [Docker Desktop](https://www.docker.com/products/docker-desktop/)
installé (Windows/Mac/Linux).

```bash
docker compose up -d
```

Ça démarre un PostgreSQL 16 dans un conteneur, avec la base
`terminator_db` et l'utilisateur `terminator_user` déjà créés (identiques
à ceux du `.env.example`). Rien d'autre à configurer.

### Option B — PostgreSQL installé nativement

- **Windows** : télécharger l'installeur sur https://www.postgresql.org/download/windows/
- **macOS** : `brew install postgresql@16 && brew services start postgresql@16`
- **Linux (Debian/Ubuntu)** : `sudo apt install postgresql postgresql-contrib`

Puis créer la base et l'utilisateur :

```bash
sudo -u postgres psql -c "CREATE USER terminator_user WITH PASSWORD 'terminator_pass';"
sudo -u postgres psql -c "CREATE DATABASE terminator_db OWNER terminator_user;"
```

(Sous Windows, utiliser `psql -U postgres` depuis l'invite de commande à
la place de `sudo -u postgres psql`.)

### Backend Django

```bash
python3 -m venv venv
source venv/bin/activate          # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # les valeurs par defaut correspondent
                                    # a docker-compose.yml / Option A

python3 manage.py migrate
python3 manage.py createsuperuser
python3 manage.py runserver
```

Si PostgreSQL n'est pas joignable (mauvais mot de passe, service non
démarré, etc.), Django lèvera une erreur de connexion explicite au
`migrate`. Dans ce cas, vérifier que le conteneur/service tourne
(`docker compose ps` ou `pg_isready`) avant de relancer.

## Endpoints

- `GET/POST http://localhost:8000/api/v1/<domaine>/` — CRUD par domaine
  (`projets`, `chartes`, `perimetres`, `wbs`, `risques`, `couts`,
  `parties-prenantes`, `activites`, `ressources`, `approvisionnements`)
- `POST http://localhost:8000/api/v1/auth/token/` — obtenir un token JWT
  (`{"username": "...", "password": "..."}`)
- `POST http://localhost:8000/api/v1/auth/token/refresh/` — rafraîchir le token
- `http://localhost:8000/admin/` — interface d'administration Django

Tous les endpoints `/api/v1/` (hors `auth/`) exigent un header
`Authorization: Bearer <access_token>`.

## PostgreSQL (production)

Dans `.env` :

```
USE_POSTGRES=True
DB_NAME=terminator_db
DB_USER=terminator_user
DB_PASSWORD=...
DB_HOST=localhost
DB_PORT=5432
```
