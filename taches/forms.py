from django import forms
from .models import Tache


class TacheForm(forms.ModelForm):
	"""ModelForm for creating/editing Tache instances."""

	class Meta:
		model = Tache
		fields = ["titre", "description", "termine"]
		widgets = {
			"description": forms.Textarea(attrs={"rows": 4}),
		}
