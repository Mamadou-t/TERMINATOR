#!/usr/bin/env sh
# Sauvegarde quotidienne de la base Terminator (a mettre en cron).
# Exemple de cron (tous les jours a 2h) :
#   0 2 * * * /home/UTILISATEUR/terminator/terminator-backend/deploy/backup.sh >> /var/log/terminator-backup.log 2>&1
#
# IMPORTANT : copiez aussi ces dumps HORS du VPS (autre serveur / stockage
# objet / snapshot Hostinger). Un backup sur le meme disque ne protege pas
# d'une panne disque.
set -eu

DB_USER="${DB_USER:-terminator_user}"
DB_NAME="${DB_NAME:-terminator_db}"
BACKUP_DIR="${BACKUP_DIR:-/opt/terminator/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

STAMP="$(date +%F_%H%M)"
mkdir -p "$BACKUP_DIR"

docker exec terminator_db pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/terminator_$STAMP.sql.gz"

# Rotation : on garde les N derniers jours.
find "$BACKUP_DIR" -name 'terminator_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete

echo "Sauvegarde OK : $BACKUP_DIR/terminator_$STAMP.sql.gz"
