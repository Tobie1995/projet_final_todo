from rest_framework import serializers
from .models import Tache


class TacheSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Tache - expose tous les champs."""
    proprietaire = serializers.ReadOnlyField(source='proprietaire.username')

    class Meta:
        model = Tache
        fields = '__all__'
        read_only_fields = ('owner', 'cree_le')
