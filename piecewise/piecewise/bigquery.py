import httplib2

from apiclient.discovery import build
from oauth2client.client import flow_from_clientsecrets
from oauth2client.file import Storage
from oauth2client import tools
import os

PROJECT_NUMBER = '819467010820'
PARENT_PATH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRETS_FILE = os.path.join(PARENT_PATH,  'client_secrets.json')
CREDENTIALS_FILE = os.path.join(PARENT_PATH, 'bigquery_credentials.dat')

def client():
    FLOW = flow_from_clientsecrets(SECRETS_FILE, scope='https://www.googleapis.com/auth/bigquery')

    storage = Storage(CREDENTIALS_FILE)
    credentials = storage.get()

    class FlowFlags(): 
        noauth_local_webserver = True
        logging_level = 'ERROR'

    if credentials is None or credentials.invalid:
        # Run oauth2 flow with default arguments.
        credentials = tools.run_flow(FLOW, storage, FlowFlags())

    http = httplib2.Http()
    http = credentials.authorize(http)

    bigquery_service = build('bigquery', 'v2', http = http)
    return bigquery_service
