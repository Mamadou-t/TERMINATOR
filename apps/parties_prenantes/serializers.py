from rest_framework import serializers

from .models import Impliquer, Particier, PartiePrenante


class PartiePrenanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartiePrenante
        fields = "__all__"
        read_only_fields = ("id", "cree_le", "modifie_le")


class ImpliquerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Impliquer
        fields = ("projet", "partie_prenante")


class ParticierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Particier
        fields = ("partie_prenante", "activite")
