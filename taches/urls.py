
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import TacheViewSet, TestCeleryView, StartReportGenerationView, CheckTaskStatusView, TacheAvecCommentairesView

from django.contrib.auth import views as auth_views

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
    
    # Alias explicites pour l'API
    path("api/liste/", TacheViewSet.as_view({"get": "list"}), name="api_liste"),
    path("api/detail/<int:pk>/", TacheViewSet.as_view({"get": "retrieve"}), name="detail"),
    path('api/taches-avec-commentaires/', TacheAvecCommentairesView.as_view(), name='api_taches_avec_commentaires'),
    # Inclure les URLs générées par le routeur à la racine de l'app
    path('', include(router.urls)),
    path('test-celery/', TestCeleryView.as_view(), name='test_celery'),
    path('start-report/', StartReportGenerationView.as_view(), name='start-report'),
    path('check-report-status/<str:task_id>/', CheckTaskStatusView.as_view(), name='check-report-status'),
]