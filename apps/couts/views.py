from rest_framework import viewsets, permissions

from .models import Cout
from .serializers import CoutSerializer


class CoutViewSet(viewsets.ModelViewSet):
    queryset = Cout.objects.all()
    serializer_class = CoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = {
        'activite': ['exact'],
        'activite__wbs__projet': ['exact'],
    }
