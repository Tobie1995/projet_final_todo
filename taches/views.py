from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.urls import reverse

from .models import Tache
from .forms import TacheForm
from rest_framework.viewsets import ModelViewSet
from .serializers import TacheSerializer



class TacheViewSet(ModelViewSet):
    """ViewSet pour les opérations CRUD sur les Tache.
    
    Remplace TacheListCreateAPIView et TacheRetrieveUpdateDestroyAPIView.
    """
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer

    def get_queryset(self):
        user = getattr(self.request, "user", None)
        if user and user.is_authenticated:
            # Filtrer par le champ de base de données 'owner'
            return Tache.objects.filter(owner=user).order_by('-cree_le')
        return Tache.objects.none()

    def perform_create(self, serializer):
        # Associer l'utilisateur connecté via le champ de base de données 'owner'
        serializer.save(owner=self.request.user)


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
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)
    t = get_object_or_404(Tache, pk=pk, owner=user)
    return JsonResponse({"id": t.pk, "titre": t.titre, "description": t.description, "termine": t.termine, "cree_le": t.cree_le.isoformat()})


def tache_create(request):
    """Création via POST de type API (conservée pour compatibilité ascendante).

    Pour la création via formulaire HTML, utilisez `tache_create_form` (URL :
    `ajouter/`).
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST with 'titre' and optional 'description' and 'termine'"})

    titre = request.POST.get("titre")
    if not titre:
        return HttpResponseBadRequest("'titre' is required")
    description = request.POST.get("description", "")
    termine = request.POST.get("termine") in ("1", "true", "True", "on")
    t = Tache.objects.create(titre=titre, description=description, termine=termine, owner=user)
    return JsonResponse({"id": t.pk, "titre": t.titre})


def tache_update(request, pk):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)
    t = get_object_or_404(Tache, pk=pk, owner=user)
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST with fields to update (titre, description, termine)"})

    titre = request.POST.get("titre")
    if titre is not None:
        t.titre = titre
    if "description" in request.POST:
        t.description = request.POST.get("description", "")
    if "termine" in request.POST:
        t.termine = request.POST.get("termine") in ("1", "true", "True", "on")
    t.save()
    return JsonResponse({"id": t.pk, "titre": t.titre, "termine": t.termine})


def tache_delete(request, pk):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=403)
    t = get_object_or_404(Tache, pk=pk, owner=user)
    if request.method != "POST":
        return JsonResponse({"detail": "Send a POST to delete this resource"})
    t.delete()
    return JsonResponse({"deleted": pk})


def tache_create_form(request):
    """Affiche et traite un ModelForm pour créer une nouvelle `Tache`.

    En cas de succès, redirige vers la vue HTML list (nom : 'taches:liste_html').
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return HttpResponseForbidden("Authentication required")
    
    if request.method == 'POST':
        form = TacheForm(request.POST)
        if form.is_valid():
            t = form.save(commit=False)
            t.owner = user
            t.save()
            return redirect(reverse('taches:liste_html'))
    else:
        form = TacheForm()

    return render(request, 'taches/tache_form.html', {'form': form})


def tache_update_form(request, pk):
    """Affiche et traite un ModelForm pour modifier une `Tache` existante.

    Réutilise le template `taches/tache_form.html`. En cas de succès, redirige
    vers la vue HTML list (nom : 'taches:liste_html').
    """
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return HttpResponseForbidden("Authentication required")
    t = get_object_or_404(Tache, pk=pk, owner=user)

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
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return HttpResponseForbidden("Authentication required")
    t = get_object_or_404(Tache, pk=pk, owner=user)

    if request.method == 'POST':
        t.delete()
        return redirect(reverse('taches:liste_html'))

    return render(request, 'taches/tache_confirm_delete.html', {'tache': t})