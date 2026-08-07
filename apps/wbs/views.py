from rest_framework import viewsets, permissions

from .models import WBS
from .serializers import WBSSerializer


class WBSViewSet(viewsets.ModelViewSet):
    queryset = WBS.objects.all()
    serializer_class = WBSSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['projet', 'wbs_parent']
