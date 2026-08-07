from rest_framework.routers import DefaultRouter

from .views import ActiviteViewSet

router = DefaultRouter()
router.register(r"", ActiviteViewSet, basename="activites")

urlpatterns = router.urls
