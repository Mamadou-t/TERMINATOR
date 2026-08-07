from rest_framework.routers import DefaultRouter

from .views import RisqueViewSet

router = DefaultRouter()
router.register(r"", RisqueViewSet, basename="risques")

urlpatterns = router.urls
