"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Vue pour servir le build React
from django.views.generic import View
from django.http import FileResponse
import os
from django.conf import settings

class ReactAppView(View):
    def get(self, request, *args, **kwargs):
        index_path = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
        return FileResponse(open(index_path, 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('taches/', include('taches.urls', namespace='taches')),
    # Endpoints JWT pour l'authentification
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Endpoints DRF login/logout
    path('api-auth/', include('rest_framework.urls')),
    # Toutes les autres URLs servent le build React
    path('', ReactAppView.as_view(), name='react_app'),
    path('<path:resource>', ReactAppView.as_view(), name='react_app_any'),
]
