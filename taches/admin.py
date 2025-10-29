from django.contrib import admin
from .models import Tache


@admin.register(Tache)
class TacheAdmin(admin.ModelAdmin):
	list_display = ("titre", "owner", "termine", "cree_le")
	list_filter = ("termine",)
	search_fields = ("titre", "description")

	fields = ("titre", "description", "termine", "owner")

	def save_model(self, request, obj, form, change):
		# Si aucun owner n'est défini depuis l'admin, on assigne l'utilisateur courant
		if obj.owner is None:
			obj.owner = request.user
		super().save_model(request, obj, form, change)

# Alternative simple registration:
# admin.site.register(Tache)
