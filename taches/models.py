from django.db import models


class Tache(models.Model):
	titre = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	cree_le = models.DateTimeField(auto_now_add=True)
	termine = models.BooleanField(default=False)

	def __str__(self):
		return self.titre
