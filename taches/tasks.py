import time
from celery import shared_task, Task  # pyright: ignore[reportMissingImports]
from django.core.mail import send_mail
from .models import Tache

@shared_task
def tache_test_asynchrone():
    time.sleep(5)
    print("Tâche asynchrone terminée avec succès !")


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
