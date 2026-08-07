from rest_framework.routers import DefaultRouter

from .views import WBSViewSet

router = DefaultRouter()
router.register(r"", WBSViewSet, basename="wbs")

urlpatterns = router.urls
