from django.contrib import admin
from .models import Tache


@admin.register(Tache)
class TacheAdmin(admin.ModelAdmin):
	list_display = ("titre", "termine", "cree_le")
	list_filter = ("termine",)
	search_fields = ("titre", "description")

# Alternative simple registration:
# admin.site.register(Tache)
