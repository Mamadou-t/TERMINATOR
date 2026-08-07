from rest_framework import viewsets, permissions

from .models import Impliquer, Particier, PartiePrenante
from .serializers import ImpliquerSerializer, ParticierSerializer, PartiePrenanteSerializer


class PartiePrenanteViewSet(viewsets.ModelViewSet):
    queryset = PartiePrenante.objects.all()
    serializer_class = PartiePrenanteSerializer
    permission_classes = [permissions.IsAuthenticated]


class ImpliquerViewSet(viewsets.ModelViewSet):
    """Gestion de l'association IMPLIQUER (PROJET <-> PARTIE_PRENANTE)."""

    queryset = Impliquer.objects.all()
    serializer_class = ImpliquerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['projet', 'partie_prenante']


class ParticierViewSet(viewsets.ModelViewSet):
    """Gestion de l'association PARTICIER (PARTIE_PRENANTE <-> ACTIVITES)."""

    queryset = Particier.objects.all()
    serializer_class = ParticierSerializer
    permission_classes = [permissions.IsAuthenticated]
