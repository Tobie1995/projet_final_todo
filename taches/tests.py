from django.test import TestCase
from django.urls import reverse

from .models import Tache


class TacheViewTests(TestCase):
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

