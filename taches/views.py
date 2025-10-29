from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.urls import reverse

from .models import Tache
from .forms import TacheForm
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import TacheSerializer


def tache_list(request):
	"""Retourne une liste JSON simple de tâches.

	Remarque : il s'agit d'une vue JSON de type API. Pour une page HTML affichant la
	liste, voir `tache_list_html`.
	"""
	taches = Tache.objects.all().order_by('-cree_le')
	data = [
		{"id": t.pk, "titre": t.titre, "termine": t.termine, "cree_le": t.cree_le.isoformat()}
		for t in taches
	]
	return JsonResponse({"taches": data})


def tache_list_html(request):
	"""Rend une page HTML contenant la liste des tâches."""
	taches = Tache.objects.all().order_by('-cree_le')
	return render(request, 'taches/tache_liste.html', {'taches': taches})


class TacheListCreateAPIView(ListCreateAPIView):
	"""API view listant toutes les Tache (GET) et permettant la création (POST).

	Utilise DRF generics.ListCreateAPIView avec le queryset de toutes les
	instances `Tache` et le `TacheSerializer`.
	"""

	queryset = Tache.objects.all()
	serializer_class = TacheSerializer


class TacheRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    """API view pour récupérer, mettre à jour ou supprimer une Tache.

    Hérite de DRF RetrieveUpdateDestroyAPIView. Utilise le queryset de
    toutes les instances `Tache` et le `TacheSerializer`.
    """

    queryset = Tache.objects.all()
    serializer_class = TacheSerializer


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

	titre = request.POST.get("titre")
	if not titre:
		return HttpResponseBadRequest("'titre' is required")
	description = request.POST.get("description", "")
	termine = request.POST.get("termine") in ("1", "true", "True", "on")
	t = Tache.objects.create(titre=titre, description=description, termine=termine)
	return JsonResponse({"id": t.pk, "titre": t.titre})


def tache_update(request, pk):
	t = get_object_or_404(Tache, pk=pk)
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
	t = get_object_or_404(Tache, pk=pk)
	if request.method != "POST":
		return JsonResponse({"detail": "Send a POST to delete this resource"})
	t.delete()
	return JsonResponse({"deleted": pk})


def tache_create_form(request):
	"""Affiche et traite un ModelForm pour créer une nouvelle `Tache`.

	En cas de succès, redirige vers la vue HTML list (nom : 'taches:liste_html').
	"""
	if request.method == 'POST':
		form = TacheForm(request.POST)
		if form.is_valid():
			form.save()
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
