from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponseBadRequest

from .models import Tache


def tache_list(request):
	"""Return a simple JSON list of tasks."""
	taches = Tache.objects.all().order_by('-cree_le')
	data = [
		{"id": t.pk, "titre": t.titre, "termine": t.termine, "cree_le": t.cree_le.isoformat()}
		for t in taches
	]
	return JsonResponse({"taches": data})


def tache_detail(request, pk):
	t = get_object_or_404(Tache, pk=pk)
	return JsonResponse({"id": t.pk, "titre": t.titre, "description": t.description, "termine": t.termine, "cree_le": t.cree_le.isoformat()})


def tache_create(request):
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
