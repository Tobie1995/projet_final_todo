from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.urls import reverse
from django.views import View
from django.http import HttpResponse
from .tasks import tache_test_asynchrone, send_creation_email, generate_task_report

from .models import Tache
from .forms import TacheForm
from rest_framework.viewsets import ModelViewSet
from .serializers import TacheSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from celery.result import AsyncResult



class TacheViewSet(ModelViewSet):
    """ViewSet pour les opérations CRUD sur les Tache.
    
    Remplace TacheListCreateAPIView et TacheRetrieveUpdateDestroyAPIView.
    """
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # L'utilisateur ne voit que ses propres tâches
        user = self.request.user
        if user and user.is_authenticated:
            return Tache.objects.filter(owner=user).order_by('-cree_le')
        return Tache.objects.none()

    def perform_create(self, serializer):
        # Assigne automatiquement la tâche à l'utilisateur connecté
        user = self.request.user
        if user and user.is_authenticated:
            serializer.save(owner=user)
            send_creation_email.delay(serializer.instance.id)
        else:
            raise ValueError("Vous devez être connecté pour créer une tâche.")

    def update(self, request, *args, **kwargs):
        print('PATCH/PUT reçu:', request.data)
        response = super().update(request, *args, **kwargs)
        if response.status_code >= 400:
            print('Erreur lors de la modification:', response.data)
        else:
            print('Réponse modification:', response.data)
        return response


def tache_list(request):
    """Retourne une liste JSON simple de tâches.

    Remarque : il s'agit d'une vue JSON de type API. Pour une page HTML affichant la
    liste, voir `tache_list_html`.
    """
    user = getattr(request, "user", None)
    if user and user.is_authenticated:
        taches = Tache.objects.filter(owner=user).order_by('-cree_le')
    else:
        taches = Tache.objects.none()
    data = [
        {"id": t.pk, "titre": t.titre, "termine": t.termine, "cree_le": t.cree_le.isoformat()}
        for t in taches
    ]
    return JsonResponse({"taches": data})


def tache_list_html(request):
    """Rend une page HTML contenant la liste des tâches."""
    user = getattr(request, "user", None)
    if user and user.is_authenticated:
        # Les superusers/staff voient toutes les tâches
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            taches = Tache.objects.all().order_by('-cree_le')
        else:
            taches = Tache.objects.filter(owner=user).order_by('-cree_le')
    else:
        taches = Tache.objects.none()
    return render(request, 'taches/tache_liste.html', {'taches': taches})




def tache_detail(request, pk):
    t = get_object_or_404(Tache, pk=pk)
    return JsonResponse({"id": t.pk, "titre": t.titre, "description": t.description, "termine": t.termine, "cree_le": t.cree_le.isoformat()})


def tache_create(request):
    """Création via POST de type API (conservée pour compatibilité ascendante).

    Pour la création via formulaire HTML, utilisez `tache_create_form` (URL :
    `ajouter/`).
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST with 'titre' and optional 'description' and 'termine'"})

    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return HttpResponseForbidden("Vous devez être connecté pour créer une tâche.")

    titre = request.POST.get("titre")
    if not titre:
        return HttpResponseBadRequest("'titre' is required")
    description = request.POST.get("description", "")
    termine = request.POST.get("termine") in ("1", "true", "True", "on")
    t = Tache.objects.create(titre=titre, description=description, termine=termine, owner=user)
    return JsonResponse({"id": t.pk, "titre": t.titre})


def tache_update(request, pk):
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST with fields to update (titre, description, termine)"})

    titre = request.POST.get("titre")
    description = request.POST.get("description")
    termine = request.POST.get("termine")
    from .tasks import update_tache_async
    task = update_tache_async.delay(pk, titre, description, termine)
    return JsonResponse({"id": pk, "message": "Modification en cours (asynchrone)", "task_id": task.id})


def tache_delete(request, pk):
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST to delete this resource"})
    from .tasks import delete_tache_async
    task = delete_tache_async.delay(pk)
    return JsonResponse({"id": pk, "message": "Suppression en cours (asynchrone)", "task_id": task.id})


def tache_create_form(request):
    """Affiche et traite un ModelForm pour créer une nouvelle `Tache`.

    En cas de succès, redirige vers la vue HTML list (nom : 'taches:liste_html').
    """
    if request.method == 'POST':
        form = TacheForm(request.POST)
        if form.is_valid():
            t = form.save()
            send_creation_email.delay(t.id)
            return redirect(reverse('taches:liste_html'))
    else:
        form = TacheForm()

    return render(request, 'taches/tache_form.html', {'form': form})


def tache_update_form(request, pk):
    """Affiche et traite un ModelForm pour modifier une `Tache` existante.

    Réutilise le template `taches/tache_form.html`. En cas de succès, redirige
    vers la vue HTML list (nom : 'taches:liste_html').
    """
    t = get_object_or_404(Tache, pk=pk)
    if request.method == 'POST':
        form = TacheForm(request.POST, instance=t)
        if form.is_valid():
            form.save()
            return redirect(reverse('taches:liste_html'))
    else:
        form = TacheForm(instance=t)

    return render(request, 'taches/tache_form.html', {'form': form, 'tache': t})


def tache_delete_form(request, pk):
    """Affiche une page de confirmation et supprime la `Tache` lors d'un POST.

    Utilise le template `taches/tache_confirm_delete.html`. Après suppression
    réussie, redirige vers la vue HTML list `taches:liste_html`.
    """
    t = get_object_or_404(Tache, pk=pk)
    if request.method == 'POST':
        t.delete()
        return redirect(reverse('taches:liste_html'))

    return render(request, 'taches/tache_confirm_delete.html', {'tache': t})


class TestCeleryView(View):
    def get(self, request, *args, **kwargs):
        tache_test_asynchrone.delay()
        return HttpResponse("La tâche Celery a été lancée avec succès.")


from rest_framework.permissions import AllowAny

class StartReportGenerationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        task = generate_task_report.delay()
        return Response({'task_id': task.id}, status=status.HTTP_202_ACCEPTED)


class CheckTaskStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, task_id):
        result = AsyncResult(task_id)
        return Response({
            'state': result.state,
            'result': result.result
        }, status=status.HTTP_200_OK)