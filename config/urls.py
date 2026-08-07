from django.contrib import admin
from django.urls import include, path

api_v1_patterns = [
    # Authentification (inscription, connexion, deconnexion, profil)
    path('auth/', include('apps.utilisateurs.urls')),

    path('projets/', include('apps.projets.urls')),
    path('chartes/', include('apps.charte.urls')),
    path('livrables/', include('apps.livrables.urls')),
    path('perimetres/', include('apps.perimetre.urls')),
    path('wbs/', include('apps.wbs.urls')),
    path('risques/', include('apps.risques.urls')),
    path('couts/', include('apps.couts.urls')),
    path('parties-prenantes/', include('apps.parties_prenantes.urls')),
    path('activites/', include('apps.activites.urls')),
    path('ressources/', include('apps.ressources.urls')),
    path('approvisionnements/', include('apps.approvisionnement.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_patterns)),
]
