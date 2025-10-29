from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TacheViewSet

app_name = "taches"

# Création du routeur
router = DefaultRouter()
router.register(r'taches', TacheViewSet, basename='tache')

urlpatterns = [
    # Vues HTML
    path("liste/", views.tache_list_html, name="liste_html"),
    path("ajouter/", views.tache_create_form, name="ajouter"),
    path("<int:pk>/modifier/", views.tache_update_form, name="modifier"),
    path("<int:pk>/supprimer/", views.tache_delete_form, name="supprimer"),
    
    # Inclure les URLs générées par le routeur à la racine de l'app
    path('', include(router.urls)),
]