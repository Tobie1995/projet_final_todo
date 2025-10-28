from django.urls import path
from . import views

app_name = "taches"

urlpatterns = [
    # CRUD routes for Tache
    path("", views.tache_list, name="list"),
    path("create/", views.tache_create, name="create"),
    path("<int:pk>/", views.tache_detail, name="detail"),
    path("<int:pk>/update/", views.tache_update, name="update"),
    path("<int:pk>/delete/", views.tache_delete, name="delete"),
]
