# Tourist Attractions Map with LLM Chat Assistant
Welcome to the Tourist Attractions Map project! This application integrates a chatbot powered by OpenAI's Large Language Model (LLM) with the Google Map to recommend tourist spots based on user preferences and show them on map.

# Overview
Dialog Interface: Engage in a natural conversation with the LLM assistant. Guide the chatbot by providing inputs like "I want to go to [someplace] for travel, I prefer [type of spots]".

Recommendations: The LLM assistant fetches data from the Travel Advisor API to provide recommendations tailored to your preferences.

Google Map Integration: Visualize the recommended tourist spots on a Google map, offering an intuitive way to explore potential travel destinations. Also it contains the basic function of showing the nearby restaurants, hotels and attractions.

Note: This project is a demo, and you might encounter some bugs or occasional hiccups in functionality.

Here is an example image showing how this product works. User wants a cultural trips to London and the assistant recommends the British Museum, Tate Modern and Victoria and Albert Museum. The location and details information are also shown in the front-end Google Maps.
![image](https://github.com/Agonian-DB/EC601_Project2/assets/125980676/0523ca77-fa87-4000-8caa-a8ca744d8cd9)


# Acknowledgment
The frontend framework of this project is inspired by and based on this repository 'https://github.com/adrianhajdin/project_travel_advisor'.

The backend integration with the Langchain-based chat is an original contribution built specifically for this project.

# Getting Started
## Prerequisites
Ensure that you have all the required packages installed. Refer to the package.json file for a list of dependencies.

## API Configuration
API Keys: Set up the necessary API keys.
Check the src/.env file for environment variables.
Modify the src/api/travelAdvisorAPI.js and public/index.html for frontend API configuration.
Update the src/components/Dialog/attractionsChat.py for backend API configuration.
Caution: The API configuration is not encapsulated optimally. Handle with care and avoid exposing sensitive API keys.
# Running the Project
## Frontend:

Navigate to the src directory.
Run the command ```npm start``` to launch the frontend.
## Backend:

Navigate to the src/components/Dialog directory.
Run the command ```python attractionsChat.py``` to start the backend server.


