from rest_framework.routers import DefaultRouter

from .views import LivrableViewSet

router = DefaultRouter()
router.register(r"", LivrableViewSet, basename="livrables")

urlpatterns = router.urls
