from rest_framework.routers import DefaultRouter

from .views import ProjetViewSet

router = DefaultRouter()
router.register(r"", ProjetViewSet, basename="projets")

urlpatterns = router.urls
