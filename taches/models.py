from django.db import models
from django.conf import settings


class Tache(models.Model):
	titre = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	cree_le = models.DateTimeField(auto_now_add=True)
	termine = models.BooleanField(default=False)
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='taches', null=True, blank=True)

	def __str__(self):
		return self.titre

	@property
	def proprietaire(self):
		return self.owner