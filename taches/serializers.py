from rest_framework import serializers
from .models import Tache


class TacheSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Tache - expose tous les champs."""

    class Meta:
        model = Tache
        fields = '__all__'
