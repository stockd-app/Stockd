FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY recipe_recommender_requirements.txt .

RUN pip install --no-cache-dir -r recipe_recommender_requirements.txt

# Download NLTK data
RUN python -m nltk.downloader wordnet omw-1.4

COPY . .

EXPOSE 9001

CMD ["python", "recipe_recommender_server.py"]