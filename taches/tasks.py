import time
from celery import shared_task, Task  # pyright: ignore[reportMissingImports]
from django.core.mail import send_mail
from .models import Tache

@shared_task
def tache_test_asynchrone():
    time.sleep(5)
    print("Tâche asynchrone terminée avec succès !")

from celery import shared_task
import time

@shared_task
def generate_task_report():
    time.sleep(15)
    return "Le rapport de tâches a été généré avec succès !"

@shared_task(autoretry_for=(Exception,), max_retries=3, retry_backoff=False, retry_kwargs={'countdown': 10})
def send_creation_email(tache_id):
    tache = Tache.objects.get(pk=tache_id)
    subject = f"Nouvelle tâche créée : {tache.titre}"
    message = f"La tâche '{tache.titre}' a été créée."
    send_mail(
        subject,
        message,
        'no-reply@example.com',
        ['admin@example.com'],
    )

# Tâche Celery pour modification asynchrone
@shared_task
def update_tache_async(tache_id, titre=None, description=None, termine=None):
    try:
        tache = Tache.objects.get(pk=tache_id)
        if titre is not None:
            tache.titre = titre
        if description is not None:
            tache.description = description
        if termine is not None:
            tache.termine = termine in ("1", "true", "True", "on", True)
        tache.save()
        return f"Tâche {tache_id} modifiée"
    except Tache.DoesNotExist:
        return f"Tâche {tache_id} introuvable"

# Tâche Celery pour suppression asynchrone
@shared_task
def delete_tache_async(tache_id):
    try:
        tache = Tache.objects.get(pk=tache_id)
        tache.delete()
        return f"Tâche {tache_id} supprimée"
    except Tache.DoesNotExist:
        return f"Tâche {tache_id} introuvable"
