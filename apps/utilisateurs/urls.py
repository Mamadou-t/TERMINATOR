from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import ConnexionView, DeconnexionView, InscriptionView, ProfilView

urlpatterns = [
    path('inscription/', InscriptionView.as_view(), name='auth_inscription'),
    path('connexion/', ConnexionView.as_view(), name='auth_connexion'),
    path('connexion/rafraichir/', TokenRefreshView.as_view(), name='auth_rafraichir'),
    path('deconnexion/', DeconnexionView.as_view(), name='auth_deconnexion'),
    path('moi/', ProfilView.as_view(), name='auth_moi'),
]
