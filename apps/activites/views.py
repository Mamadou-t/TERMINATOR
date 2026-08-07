from rest_framework import viewsets, permissions

from .models import Activite
from .serializers import ActiviteSerializer


class ActiviteViewSet(viewsets.ModelViewSet):
    queryset = Activite.objects.all()
    serializer_class = ActiviteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = {
        'wbs': ['exact'],
        'wbs__projet': ['exact'],
    }
