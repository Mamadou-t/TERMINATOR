# Déploiement Terminator — VPS Hostinger (KVM 2, Docker)

Stack : **PostgreSQL + Django (gunicorn) + nginx** dans Docker Compose.
nginx sert le front (SPA) et proxifie `/api`, `/admin`, `/static` vers Django
→ **même origine, pas de CORS**.

Les deux dépôts sont clonés **côte à côte** sur le VPS :

```
~/terminator/
├── terminator-backend/     (API + docker-compose.prod.yml)
└── projet_terminator/      (front + deploy/Dockerfile.nginx)
```

---

## Étape 0 — En local : pousser le code sur GitHub

Rien n'est encore poussé. Un seul dépôt `Mamadou-t/TERMINATOR`, deux branches :
- les changements **front** → branche **`main`**
- les changements **back** → branche **`backend`**

Le VPS récupérera le code via `git clone` (étape 2).

> ⚠️ Ne committe jamais `.env.prod` (ignoré par git). Seul `.env.prod.example` est versionné.
> ⚠️ Pousser sur `main`/`backend` peut redéclencher les anciens déploiements
> Vercel/Railway. Sans importance (on migre vers Hostinger), mais tu peux
> déconnecter ces intégrations dans Vercel/Railway pour éviter le bruit.

---

## Étape 1 — Se connecter au VPS et installer Docker

```bash
ssh root@VOTRE_IP_VPS          # identifiants dans le panneau Hostinger (hPanel)

# Installer Docker + le plugin compose (si l'image VPS ne les a pas déjà) :
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

*(Si tu as choisi le **template VPS « Docker »** dans hPanel, Docker est déjà installé.)*

---

## Étape 2 — Cloner les deux dépôts

Le front et le back sont **deux branches du même dépôt** `Mamadou-t/TERMINATOR` :
`main` = front, `backend` = back. On clone donc le même repo deux fois, sur la
bonne branche :

```bash
mkdir -p ~/terminator && cd ~/terminator
git clone -b backend https://github.com/Mamadou-t/TERMINATOR.git terminator-backend
git clone -b main    https://github.com/Mamadou-t/TERMINATOR.git projet_terminator
```

Si le dépôt est privé : crée un **Personal Access Token** GitHub et utilise-le
comme mot de passe, ou configure une clé SSH sur le VPS.

---

## Étape 3 — Configurer les variables d'environnement

```bash
cd ~/terminator/terminator-backend
cp .env.prod.example .env.prod
nano .env.prod
```

À remplir **obligatoirement** :
- `SECRET_KEY` : une longue chaîne aléatoire →
  `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`
- `ALLOWED_HOSTS` : mets l'**IP du VPS** (ex. `ALLOWED_HOSTS=203.0.113.10,localhost,127.0.0.1`)
- `DB_PASSWORD` : un mot de passe fort.

Laisse `DEBUG=False`, `DB_HOST=db`, `DB_SSL_REQUIRE=False`.

---

## Étape 4 — Lancer le stack

```bash
cd ~/terminator/terminator-backend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Le conteneur `web` applique **automatiquement les migrations** (les 9 nouvelles
migrations passent ici) puis `collectstatic`, puis démarre gunicorn.

Vérifier :
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web    # Ctrl+C pour sortir
```

Ouvre **http://VOTRE_IP_VPS** → l'application doit s'afficher.

---

## Étape 5 — Créer un compte administrateur

```bash
docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
```

*(L'admin Django est sur `http://VOTRE_IP_VPS/admin/`. Note : tant qu'on est en
HTTP, la connexion admin peut être limitée par les cookies sécurisés ; l'API du
front, elle, marche en HTTP car elle utilise des jetons JWT. Tout rentre dans
l'ordre une fois le HTTPS activé — étape 7.)*

---

## Étape 6 — Sauvegardes automatiques de la base

```bash
chmod +x ~/terminator/terminator-backend/deploy/backup.sh
crontab -e
# Ajouter (sauvegarde tous les jours à 2h) :
0 2 * * * DB_USER=terminator_user DB_NAME=terminator_db ~/terminator/terminator-backend/deploy/backup.sh >> /var/log/terminator-backup.log 2>&1
```

> ⚠️ Copie aussi ces dumps **hors du VPS** (snapshot Hostinger, autre stockage).
> Un backup sur le même disque ne protège pas d'une panne disque.

---

## Étape 7 — (Plus tard) Domaine + HTTPS

1. Dans ta zone DNS, fais pointer le domaine (enregistrement **A**) vers l'IP du VPS.
2. Ajoute le domaine dans `.env.prod` :
   - `ALLOWED_HOSTS=terminator.ci,www.terminator.ci,VOTRE_IP_VPS,localhost,127.0.0.1`
   - `CSRF_TRUSTED_ORIGINS=https://terminator.ci,https://www.terminator.ci`
   - `SECURE_SSL_REDIRECT=True`
3. Active le certificat **Let's Encrypt** (gratuit).

👉 Quand tu es à cette étape, **demande à Claude la config HTTPS** : on ajoutera
soit un reverse-proxy **Caddy** (HTTPS automatique) devant le stack, soit
**certbot** — c'est quelques lignes à ajouter au compose.

---

## Mettre à jour l'app (après un nouveau push)

```bash
cd ~/terminator/terminator-backend && git pull
cd ~/terminator/projet_terminator && git pull
cd ~/terminator/terminator-backend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

---

## Dépannage

- **Voir les logs** : `docker compose -f docker-compose.prod.yml logs -f web` (ou `nginx`, `db`).
- **La page charge mais l'API échoue** : vérifie `ALLOWED_HOSTS` (doit contenir l'IP/domaine) et les logs `web`.
- **Erreur base de données** : `docker compose -f docker-compose.prod.yml logs db` ; vérifie que `DB_PASSWORD` est cohérent (si tu l'as changé après le 1er lancement, supprime le volume `terminator_pgdata` — ⚠️ efface les données — ou change le mot de passe dans Postgres).
- **Rebuild propre** : `docker compose -f docker-compose.prod.yml down && ... up -d --build`.
- **Restaurer un backup** : `gunzip -c backups/terminator_XXXX.sql.gz | docker exec -i terminator_db psql -U terminator_user -d terminator_db`.
