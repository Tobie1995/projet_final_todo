import time
from celery import shared_task  # pyright: ignore[reportMissingImports]

@shared_task
def tache_test_asynchrone():
    time.sleep(5)
    print("Tâche asynchrone terminée avec succès !")
