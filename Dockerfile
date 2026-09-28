# Image de l'API Django (Terminator) pour le VPS Hostinger.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# psycopg2-binary embarque ses libs : pas besoin de compiler.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Au demarrage : migrations + collecte des statiques (admin/DRF) + gunicorn.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi --bind 0.0.0.0:8000 --workers 3 --timeout 120 --log-file -"]
