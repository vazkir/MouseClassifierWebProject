# Basic command explantion 1: https://simpleisbetterthancomplex.com/tutorial/2018/08/27/how-to-create-custom-django-management-commands.html
# Basic command explantion 2: https://docs.djangoproject.com/en/2.2/howto/custom-management-commands/
import os
from distutils.dir_util import copy_tree
from django.core.management.base import BaseCommand
from django.conf import settings
from react_helper.helpers import update_react_static_build


# This is a custom command to copy the react static files in a subdirectory in the main static folder
# I created this because collectstatic always puts them in the main file and,
# react generates multiple files with all random different names that I don't want to keep referencing
# So I created a template tag that loops through these folders to ouput their contents
class Command(BaseCommand):
    help = 'Custom command for copying react static files (the build) into the main static/react folder'

    def handle(self, *args, **kwargs):
        update_react_static_build()
