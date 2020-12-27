from flask import Flask, request, send_from_directory
from flask_cors import CORS, cross_origin
from google.oauth2 import service_account
from google.api_core.exceptions import ResourceExhausted
import dialogflow
import os, json
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
DIALOGFLOW_PROJECT_ID = os.environ.get('DIALOGFLOW_PROJECT_ID')
DIALOGFLOW_SESSION_ID = os.environ.get('DIALOGFLOW_SESSION_ID')

credentials_raw = json.loads(GOOGLE_APPLICATION_CREDENTIALS)
credentials = service_account.Credentials.from_service_account_info(credentials_raw)

session_client = dialogflow.SessionsClient(credentials=credentials)
session = session_client.session_path(DIALOGFLOW_PROJECT_ID, DIALOGFLOW_SESSION_ID)

app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app, support_credentials=True)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/query', methods=['POST'])
@cross_origin(supports_credentials=True)
def query():
    data = request.get_json()

    text_input = dialogflow.types.TextInput(text=data['text'], language_code='en-US')
    query_input = dialogflow.types.QueryInput(text=text_input)
    try:
        response = session_client.detect_intent(session=session, query_input=query_input)
    except ResourceExhausted:
        return 'quota reached', 500

    return {
        'query_text': response.query_result.query_text,
        'detected_intent': response.query_result.intent.display_name,
        'detected_intent_confidence': response.query_result.intent_detection_confidence,
        'result_text': response.query_result.fulfillment_text
    }

@app.route('/resume')
def fetch_resume():
    return send_from_directory('static', 'RESUME.pdf')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)