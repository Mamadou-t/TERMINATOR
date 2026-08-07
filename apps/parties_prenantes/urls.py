from rest_framework.routers import DefaultRouter

from .views import ImpliquerViewSet, ParticierViewSet, PartiePrenanteViewSet

router = DefaultRouter()
router.register(r"impliquer", ImpliquerViewSet, basename="impliquer")
router.register(r"particier", ParticierViewSet, basename="particier")
router.register(r"", PartiePrenanteViewSet, basename="parties-prenantes")

urlpatterns = router.urls
