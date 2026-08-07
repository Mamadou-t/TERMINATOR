from rest_framework import viewsets, permissions

from .models import Approvisionnement, Subir
from .serializers import ApprovisionnementSerializer, SubirSerializer


class ApprovisionnementViewSet(viewsets.ModelViewSet):
    queryset = Approvisionnement.objects.all()
    serializer_class = ApprovisionnementSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubirViewSet(viewsets.ModelViewSet):
    """Gestion de l'association SUBIR (ACTIVITES <-> APPROVISIONNEMENT)."""

    queryset = Subir.objects.all()
    serializer_class = SubirSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = {
        'activite': ['exact'],
        'approvisionnement': ['exact'],
        'activite__wbs__projet': ['exact'],
    }
