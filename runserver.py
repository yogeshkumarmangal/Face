"""
This script runs the FlaskWebProject1 application using a development server.
"""

from os import environ
from FlaskWebProject1 import app 
from waitress import serve
import os
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')
if __name__ == '__main__':
     
        PORT=int(os.environ.get('PORT', 5000))
        serve(app, port=PORT)

        #set this command in heroku command
        #heroku config:add PORT=5000
