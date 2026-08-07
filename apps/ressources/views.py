from rest_framework import viewsets, permissions

from .models import Ressource
from .serializers import RessourceSerializer


class RessourceViewSet(viewsets.ModelViewSet):
    queryset = Ressource.objects.all()
    serializer_class = RessourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = {
        'activite': ['exact'],
        'activite__wbs__projet': ['exact'],
    }
