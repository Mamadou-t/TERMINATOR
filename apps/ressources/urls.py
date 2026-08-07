from rest_framework.routers import DefaultRouter

from .views import RessourceViewSet

router = DefaultRouter()
router.register(r"", RessourceViewSet, basename="ressources")

urlpatterns = router.urls
