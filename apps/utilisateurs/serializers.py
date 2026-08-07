from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

Utilisateur = get_user_model()


class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ('id', 'email', 'nom', 'prenom', 'is_staff', 'cree_le')
        read_only_fields = ('id', 'is_staff', 'cree_le')


class InscriptionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ('id', 'email', 'nom', 'prenom', 'password', 'password_confirmation')
        read_only_fields = ('id',)

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirmation'):
            raise serializers.ValidationError(
                {'password_confirmation': 'Les mots de passe ne correspondent pas.'}
            )
        return attrs

    def create(self, validated_data):
        return Utilisateur.objects.create_user(**validated_data)


class ConnexionSerializer(TokenObtainPairSerializer):
    """Login par email : ajoute le profil utilisateur a la reponse du token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nom'] = user.nom
        token['prenom'] = user.prenom
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['utilisateur'] = UtilisateurSerializer(self.user).data
        return data
