from django.db import models
from django.db.models import Count, Sum, Avg, Q
from django.contrib.auth import get_user_model
from django.conf import settings


class Tache(models.Model):
	@classmethod
	def taches_avec_nombre_commentaires(cls):
		"""Retourne toutes les tâches annotées avec le nombre de commentaires."""
		return cls.objects.annotate(nb_commentaires=Count('commentaires'))
	@classmethod
	def stats_aggregate(cls):
		"""Exemples d'utilisation de Count et Q pour les statistiques."""
		total = cls.objects.aggregate(total_taches=Count('id'))['total_taches']
		total_terminees = cls.objects.filter(termine=True).aggregate(taches_terminees=Count('id'))['taches_terminees']
		moyenne_priorite = cls.objects.aggregate(moyenne_priorite=Avg('priorite'))['moyenne_priorite']
		return {
			'total': total,
			'total_terminees': total_terminees,
			'moyenne_priorite': moyenne_priorite
		}
	titre = models.CharField(max_length=200, db_index=True)
	description = models.TextField(blank=True)
	cree_le = models.DateTimeField(auto_now_add=True)
	termine = models.BooleanField(default=False)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='taches', null=True, blank=True)

	priorite = models.IntegerField(default=1)

	def __str__(self):
		return self.titre
	@classmethod
	def stats(cls):
		total = cls.objects.count()
		total_terminees = cls.objects.filter(termine=True).count()
		moyenne_priorite = cls.objects.aggregate(Avg('priorite'))['priorite__avg']
		return {
			'total': total,
			'total_terminees': total_terminees,
			'moyenne_priorite': moyenne_priorite
		}

	@classmethod
	def taches_avec_commentaires(cls):
		"""Retourne toutes les tâches avec les commentaires préchargés (évite N+1)."""
		return cls.objects.prefetch_related('commentaires').all()

	@property
	def proprietaire(self):
		return self.owner

class Commentaire(models.Model):
	tache = models.ForeignKey('Tache', on_delete=models.CASCADE, related_name='commentaires')
	user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
	contenu = models.TextField()
	cree_le = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Commentaire de {self.user} sur {self.tache}"

	@classmethod
	def commentaires_avec_tache_et_user(cls):
		"""Retourne tous les commentaires avec les objets Tache et User préchargés."""
		return cls.objects.select_related('tache', 'user').all()