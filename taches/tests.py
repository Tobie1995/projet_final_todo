from django.test import TestCase
from django.urls import reverse

from .models import Tache


class TacheViewTests(TestCase):
	def test_update_tache_via_post_triggers_async_and_updates(self):
		"""POST sur la modification doit lancer la tâche Celery et modifier la Tache."""
		# Création d'une tâche à modifier
		tache = Tache.objects.create(titre='Tâche à modifier', description='Ancienne description')
		url = reverse('taches:modifier', args=[tache.pk])
		data = {
			'titre': 'Tâche modifiée',
			'description': 'Nouvelle description',
			'termine': 'True',
		}
		response = self.client.post(url, data)
		self.assertEqual(response.status_code, 200)
		# La tâche doit être modifiée en base (simulateur, car Celery est asynchrone)
		tache.refresh_from_db()
		self.assertEqual(tache.titre, 'Tâche modifiée')
		self.assertEqual(tache.description, 'Nouvelle description')
		self.assertTrue(tache.termine)
	def test_tache_list_html_renders(self):
		"""The HTML task list page should load successfully (HTTP 200)."""
		url = reverse('taches:liste_html')
		response = self.client.get(url)
		self.assertEqual(response.status_code, 200)

	def test_create_tache_via_post_redirects_and_creates(self):
		"""POSTing the create form should create a Tache and redirect to the list."""
		url = reverse('taches:ajouter')
		data = {
			'titre': 'Nouvelle tâche de test',
			'description': 'Description de test',
			# 'termine' omitted -> should default to False
		}
		response = self.client.post(url, data)

		# Should redirect to the list page after successful create
		self.assertEqual(response.status_code, 302)
		self.assertEqual(response.url, reverse('taches:liste_html'))

		# The task should exist in the database
		self.assertTrue(Tache.objects.filter(titre='Nouvelle tâche de test').exists())
	
	def test_delete_tache_via_post_triggers_async_and_deletes(self):
		"""POST sur la suppression doit lancer la tâche Celery et supprimer la Tache."""
		# Création d'une tâche à supprimer
		tache = Tache.objects.create(titre='Tâche à supprimer', description='À supprimer')
		url = reverse('taches:supprimer', args=[tache.pk])
		response = self.client.post(url)
		self.assertEqual(response.status_code, 200)
		# La tâche doit être supprimée en base (simulateur, car Celery est asynchrone)
		tache.refresh_from_db()
		self.assertFalse(Tache.objects.filter(pk=tache.pk).exists())

