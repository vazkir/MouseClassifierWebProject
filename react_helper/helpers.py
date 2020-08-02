import os
import logging
from distutils.dir_util import copy_tree
from django.conf import settings
from react_helper import REACT_DJANGO_STATIC_DIR, REACT_ROOT

# Updates or creates the sub directory for the js files in the main static root,
# while pulling them from the React Apps's build folder for the latest release
# TODO: Maybe check if the files are renewed, and maybe delete the dir first (not sure if neccesary?)
def update_react_static_build():
    # Makes sure logger.info is also printed to the console
    logging.getLogger().setLevel(logging.INFO)

    # Location of React's static build files
    react_static_build_dir = REACT_ROOT + '/build/static'

    # Create the react folder if non-existent yet
    if not os.path.exists(REACT_DJANGO_STATIC_DIR):
        logging.info("Creating the static/react folder since non existent yet")
        os.mkdir(REACT_DJANGO_STATIC_DIR)

    # https://stackoverflow.com/questions/15034151/copy-directory-contents-into-a-directory-with-python
    try:
        copy_tree(react_static_build_dir, REACT_DJANGO_STATIC_DIR)
    except EnvironmentError as e:
        logging.error("Unable to copy file, because an error happened %s" % e)
    else:
        logging.info("Succes add or renewd static react files")
