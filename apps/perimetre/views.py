from rest_framework import viewsets, permissions

from .models import Perimetre
from .serializers import PerimetreSerializer


class PerimetreViewSet(viewsets.ModelViewSet):
    queryset = Perimetre.objects.all()
    serializer_class = PerimetreSerializer
    permission_classes = [permissions.IsAuthenticated]
