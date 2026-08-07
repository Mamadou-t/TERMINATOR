from rest_framework.routers import DefaultRouter

from .views import ApprovisionnementViewSet, SubirViewSet

router = DefaultRouter()
router.register(r"subir", SubirViewSet, basename="subir")
router.register(r"", ApprovisionnementViewSet, basename="approvisionnement")

urlpatterns = router.urls
