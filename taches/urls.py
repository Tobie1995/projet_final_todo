from django.urls import path
from . import views

app_name = "taches"

urlpatterns = [
    # CRUD routes for Tache
    path("", views.tache_list, name="list"),
    path("create/", views.tache_create, name="create"),
    # HTML views
    path("liste/", views.tache_list_html, name="liste_html"),
    path("ajouter/", views.tache_create_form, name="ajouter"),
    path("<int:pk>/modifier/", views.tache_update_form, name="modifier"),
    path("<int:pk>/supprimer/", views.tache_delete_form, name="supprimer"),
    path("<int:pk>/", views.tache_detail, name="detail"),
    path("<int:pk>/update/", views.tache_update, name="update"),
    path("<int:pk>/delete/", views.tache_delete, name="delete"),
]
