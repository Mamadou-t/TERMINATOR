from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import ConnexionSerializer, InscriptionSerializer, UtilisateurSerializer


class InscriptionView(generics.CreateAPIView):
    serializer_class = InscriptionSerializer
    permission_classes = [permissions.AllowAny]


class ConnexionView(TokenObtainPairView):
    serializer_class = ConnexionSerializer
    permission_classes = [permissions.AllowAny]


class DeconnexionView(APIView):
    """Blackliste le refresh token pour invalider la session cote serveur."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            RefreshToken(refresh_token).blacklist()
        except (KeyError, TokenError):
            return Response(
                {'detail': 'Jeton de rafraichissement invalide ou manquant.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ProfilView(generics.RetrieveUpdateAPIView):
    serializer_class = UtilisateurSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
