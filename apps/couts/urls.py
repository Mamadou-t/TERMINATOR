from rest_framework.routers import DefaultRouter

from .views import CoutViewSet

router = DefaultRouter()
router.register(r"", CoutViewSet, basename="couts")

urlpatterns = router.urls
