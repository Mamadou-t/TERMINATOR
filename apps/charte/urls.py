from rest_framework.routers import DefaultRouter

from .views import (
    CharteViewSet,
    LigneBudgetairePrevisionnelleViewSet,
    LigneCalendrierPrevisionnelViewSet,
)

router = DefaultRouter()
# Enregistre les sous-ressources AVANT la charte (prefixe vide) pour qu'elles
# ne soient pas captures comme un detail de charte.
router.register(r"lignes-budgetaires", LigneBudgetairePrevisionnelleViewSet, basename="ligne-budgetaire")
router.register(r"lignes-calendrier", LigneCalendrierPrevisionnelViewSet, basename="ligne-calendrier")
router.register(r"", CharteViewSet, basename="charte")

urlpatterns = router.urls
