from rest_framework import viewsets, permissions

from .models import Projet
from .serializers import ProjetSerializer


class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["projet_parent"]
