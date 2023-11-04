import os
import warnings

from langchain.prompts import PromptTemplate
from langchain.schema import AgentFinish,SystemMessage, HumanMessage


warnings.filterwarnings("ignore", category=UserWarning)
from langchain.document_loaders import CSVLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.utilities.serpapi import SerpAPIWrapper
from langchain.vectorstores.docarray import DocArrayInMemorySearch

os.environ['OPENAI_API_KEY'] = 'YOUR_API_KEY'
os.environ['SERPAPI_API_KEY'] = 'YOUR_API_KEY'
os.environ['X-RapidAPI-Key'] = 'YOUR_API_KEY'
from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain.agents import Tool, load_tools
from langchain.tools import BaseTool

# Initialize the ChatOpenAI model
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)


# Continuing from the previous code

def search_attractions(params):
    import requests
    import pandas as pd
    location, query = params.split(", ")
    # location to location_id data
    url = "https://travel-advisor.p.rapidapi.com/locations/auto-complete"
    querystring = {"query": location, "lang": "en_US", "units": "km"}
    headers = {
        "X-RapidAPI-Key": 'X-RapidAPI-Key',
        "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()

    # Extract location_id from the data
    location_id = None
    for result in data['data']:
        if result['result_type'] == 'geos':
            location_id = result['result_object']['location_id']
            break


    # location_id to attractions data json

    url = "https://travel-advisor.p.rapidapi.com/attractions/list"

    querystring = {"location_id": location_id, "currency": "USD", "lang": "en_US", "lunit": "km", "sort": "recommended"}

    headers = {
        "X-RapidAPI-Key": 'X-RapidAPI-Key',
        "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()


    #attractions data json to csv file
    attractions = data['data']
    all_attractions = []

    for attraction in attractions:
        # Extracting details for each attraction
        attraction_details = {}

        attraction_details['name'] = attraction.get('name', None)
        attraction_details['latitude'] = attraction.get('latitude', None)
        attraction_details['longitude'] = attraction.get('longitude', None)
        attraction_details['num_reviews'] = attraction.get('num_reviews', None)
        attraction_details['description'] = attraction.get('description', None)

        # Extracting photo URLs
        try:
            photo_urls = attraction['photo']['images']
            attraction_details['small_photo'] = photo_urls.get('small') and photo_urls.get('small').get('url', None)
            attraction_details['thumbnail_photo'] = photo_urls.get('thumbnail') and photo_urls.get('thumbnail').get(
                'url', None)
            attraction_details['original_photo'] = photo_urls.get('original') and photo_urls.get('original').get('url',
                                                                                                                 None)
            attraction_details['large_photo'] = photo_urls.get('large') and photo_urls.get('large').get('url', None)
            attraction_details['medium_photo'] = photo_urls.get('medium') and photo_urls.get('medium').get('url', None)
        except KeyError:
            # If photos are not available, set them to None
            attraction_details['small_photo'] = None
            attraction_details['thumbnail_photo'] = None
            attraction_details['original_photo'] = None
            attraction_details['large_photo'] = None
            attraction_details['medium_photo'] = None

        # Extracting opening hours
        try:
            attraction_details['hours'] = attraction['hours']['week_ranges']
        except KeyError:
            attraction_details['hours'] = None

        # Extracting website and contact details
        attraction_details['website'] = attraction.get('website', None)
        attraction_details['phone'] = attraction.get('phone', None)
        attraction_details['email'] = attraction.get('email', None)

        # Extracting address
        attraction_details['address'] = attraction.get('address', None)

        # Extracting booking offers
        try:
            offers = attraction['offer_group']['offer_list']
            attraction_offers = []
            for offer in offers:
                offer_details = {
                    'title': offer.get('title', None),
                    'price': offer.get('price', None),
                    'url': offer.get('url', None)
                }
                attraction_offers.append(offer_details)
            attraction_details['offers'] = attraction_offers
        except KeyError:
            attraction_details['offers'] = []

        # Extracting tags
        try:
            attraction_details['urgency_tag'] = attraction['tags']['urgency_tag']['tag_text']
        except KeyError:
            attraction_details['urgency_tag'] = None

        all_attractions.append(attraction_details)

    # csv file to vector database
    df = pd.DataFrame(all_attractions)

    # Write to CSV with utf-8 encoding
    df.to_csv('attractions.csv', index=False, encoding='utf-8-sig')

    file = 'attractions.csv'
    jq_schema = '''
    {
        name: .name,
        description: .description,
    }
    '''
    loader = CSVLoader(file_path=file, encoding='utf-8-sig')

    index = VectorstoreIndexCreator(
        vectorstore_cls=DocArrayInMemorySearch
    ).from_loaders([loader])

    # query for the most related attractions
    response = index.query(query)

    return response


attractions_search_tool = Tool(
    name='Attraction Search',
    func=search_attractions,
    description="Searches for attractions in a given location. Please provide the location and query as a single "
                "string, separated by a comma and a space. For example: Boston, cultural spots. for this function .The"
                "input location is the location that needs to be"
                "searched. The query can be the preference of the user. ")

from langchain.agents import initialize_agent

search = SerpAPIWrapper()
search_tool = Tool(name="Internet Search",
                   func=search.run,
                   description="Performs a web search")
tools = [attractions_search_tool]



memory = ConversationBufferWindowMemory(
    memory_key='chat_history',
    k=3,
    return_messages=True
)

# create agents
travel_agent = initialize_agent(
    agent='chat-conversational-react-description',
    tools=tools,
    llm=llm,
    verbose=True,
    max_iterations=3,
    early_stopping_method='generate',
    memory=memory
)

# user_input = 'I want to go to Boston this holiday.I prefer cultural spots. Please recommend me some attractions based on the Attraction ' \
#              'search.  And tell me your reasons for recommending'
#
from flask import Flask, request, jsonify
import os
import warnings
from flask_cors import CORS

def extract_place_names(response):
    chat = ChatOpenAI(temperature=.7)
    placeString = chat(
        [
            SystemMessage(
                content="You are a place names extraction AI bot that helps to extract all main mentioned places(attractions,hotels,restaurants with full name...) of tourist spot names in the input paragraph. Your answer should be in the format of 'place1,place2,place3,...'"),
            HumanMessage(content=response)
        ])
    placeStringContent=placeString.content
    placeList = placeStringContent.split(',')
    return placeList    

app = Flask(__name__)
CORS(app)
# ... 你的初始化代码，如设置环境变量、加载模型等 ...

@app.route('/ask', methods=['POST'])
def ask_travel_agent():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify(error='No message provided'), 400
    
    # Use your travel_agent to generate a response
    response = travel_agent.run(user_message)
    print("DEBUG: Here's the response:", response)
    place_names = extract_place_names(response)
    print("DEBUG: Here's the placesname:", place_names)
    
    return jsonify(
        user_message=user_message, 
        assistant_message=response,
        place_names=place_names
    )

if __name__ == "__main__":
    app.run(debug=False, port=5000)
    