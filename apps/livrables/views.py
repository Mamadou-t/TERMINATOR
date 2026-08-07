from rest_framework import viewsets, permissions

from .models import Livrable
from .serializers import LivrableSerializer


class LivrableViewSet(viewsets.ModelViewSet):
    queryset = Livrable.objects.all()
    serializer_class = LivrableSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['projet']
