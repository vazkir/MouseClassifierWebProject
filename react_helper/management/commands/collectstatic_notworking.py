import os
from django.conf import settings
from django.contrib.staticfiles.management.commands.collectstatic import Command as CollectstaticCommand
from react_helper.helpers import update_react_static_build

# Hooks in before the runserver command, and needs the environmentcheck because;
# elsse all the code will be triggered twice
# Source: https://stackoverflow.com/questions/28489863/why-is-run-called-twice-in-the-django-dev-server
class Command(CollectstaticCommand):
    def run(self, *args, **options):

        # Updates the React's static build files
        update_react_static_build()

        # The regular runserver continues
        super(Command, self).run(*args, **options)
