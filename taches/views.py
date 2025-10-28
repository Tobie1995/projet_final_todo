from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from django.urls import reverse

from .models import Tache
from .forms import TacheForm


def tache_list(request):
	"""Return a simple JSON list of tasks.

	Note: This is an API-style JSON view. For an HTML list page see `tache_list_html`.
	"""
	taches = Tache.objects.all().order_by('-cree_le')
	data = [
		{"id": t.pk, "titre": t.titre, "termine": t.termine, "cree_le": t.cree_le.isoformat()}
		for t in taches
	]
	return JsonResponse({"taches": data})


def tache_list_html(request):
	"""Render an HTML page with the list of tasks."""
	taches = Tache.objects.all().order_by('-cree_le')
	return render(request, 'taches/tache_liste.html', {'taches': taches})


def tache_detail(request, pk):
	t = get_object_or_404(Tache, pk=pk)
	return JsonResponse({"id": t.pk, "titre": t.titre, "description": t.description, "termine": t.termine, "cree_le": t.cree_le.isoformat()})


def tache_create(request):
	"""API-style POST create (kept for backward compatibility).

	For the HTML form-based creation use `tache_create_form` (see URL `ajouter/`).
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
	"""Render and process a ModelForm to create a new Tache.

	On success redirect to the HTML list view (name: 'taches:liste_html').
	"""
	if request.method == 'POST':
		form = TacheForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect(reverse('taches:liste_html'))
	else:
		form = TacheForm()

	return render(request, 'taches/tache_form.html', {'form': form})
