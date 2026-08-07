from rest_framework import viewsets, permissions

from .models import Charte, LigneBudgetairePrevisionnelle, LigneCalendrierPrevisionnel
from .serializers import (
    CharteSerializer,
    LigneBudgetairePrevisionnelleSerializer,
    LigneCalendrierPrevisionnelSerializer,
)


class CharteViewSet(viewsets.ModelViewSet):
    queryset = Charte.objects.all()
    serializer_class = CharteSerializer
    permission_classes = [permissions.IsAuthenticated]


class LigneBudgetairePrevisionnelleViewSet(viewsets.ModelViewSet):
    queryset = LigneBudgetairePrevisionnelle.objects.all()
    serializer_class = LigneBudgetairePrevisionnelleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["charte"]


class LigneCalendrierPrevisionnelViewSet(viewsets.ModelViewSet):
    queryset = LigneCalendrierPrevisionnel.objects.all()
    serializer_class = LigneCalendrierPrevisionnelSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["charte"]
