from rest_framework import viewsets, permissions

from .models import Risque
from .serializers import RisqueSerializer


class RisqueViewSet(viewsets.ModelViewSet):
    queryset = Risque.objects.all()
    serializer_class = RisqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = {
        'wbs': ['exact'],
        'wbs__projet': ['exact'],
    }
