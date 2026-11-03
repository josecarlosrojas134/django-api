from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Representación pública del usuario: solo lo imprescindible."""

    class Meta:
        model = User
        fields = ("id", "email")
        read_only_fields = ("id", "email")


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Añade los datos del usuario a la respuesta del login."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
