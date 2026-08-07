from rest_framework import serializers

from .models import WBS


class WBSSerializer(serializers.ModelSerializer):
    class Meta:
        model = WBS
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")
