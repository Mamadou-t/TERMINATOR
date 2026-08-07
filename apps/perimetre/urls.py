from rest_framework.routers import DefaultRouter

from .views import PerimetreViewSet

router = DefaultRouter()
router.register(r"", PerimetreViewSet, basename="perimetre")

urlpatterns = router.urls
