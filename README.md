🚀 ConceptMap Web – Setup Guide
Follow these steps to get the project running locally:

1. 📦 Set Up the PostgreSQL Database
Make sure your PostgreSQL database is ready, with the correct credentials and structure.
➡️ Detailed instructions are available here:
[View database setup instructions on Microsoft Teams](https://teams.microsoft.com/l/message/19:bn4apVzPuMf9csTKio1V00UKlvK4lPzLOzW0HPCi8vM1@thread.tacv2/1744772746600?tenantId=d1323671-cdbe-4417-b4d4-bdb24b51316b&groupId=8d14b36c-da4c-4f3f-a47e-ba0b307755ef&parentMessageId=1744772746600&teamName=ProgrammingProject-P000516CSITCP&channelName=General&createdTime=1744772746600)

2. 🛠️ Adjust File Paths
In concept-map-web/server/app.py, update the file paths to match the correct locations on your machine 

3. 🧪 Open a Split Terminal
You’ll need two terminals open – one for the frontend and one for the backend.

4. ▶️ Start the Frontend
In the first terminal:

        cd concept-map-web
        npm install
        npm start
        This will launch the React frontend.

5. 🐍 Start the Backend (Flask)
In the second terminal:

Navigate to EHRQC project’s root folder (where the virtual environment is set up).

Activate the virtual environment:

        .\.venv\Scripts\activate

Then start the Flask backend:

        python app.py

6. ✅ You're Ready to Go!
Once both the frontend and backend are running, you should be able to open the website and start using ConceptMap Web.

⚠️ Note: The concept mapping process can take a long time to finish. Just give it time — it’s probably working in the background.


🧪 Example Input That Works
Domain: Condition
Vocabulary: SNOMED
Concept Class: Clinical Finding
Concept Column: concept_name
Concept CSV File: concepts_mimiciv_meas_chartevents_value_snomed.csv
Model Pack Zip: mc_modelpack_snomed_int_16_mar_2022_25be3857ba34bdd5.zip