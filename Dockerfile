# Dockerfile pour projet Django + Celery
FROM python:3.11

# Définir le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le projet
COPY . .

# Exposer le port du serveur Django
EXPOSE 8000

# Commande par défaut (à adapter selon le besoin)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Pour Celery, vous pouvez lancer avec :
# celery -A config worker -l info
# Pour Celery Beat :
# celery -A config beat -l info

# Redis n'est pas inclus dans cette image, il faut le lancer séparément (par exemple avec docker-compose)
