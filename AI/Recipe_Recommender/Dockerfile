FROM python:3.11-slim

WORKDIR /app

# Install curl and gdown for downloading from Google Drive
RUN apt-get update && apt-get install -y curl && \
    pip install --no-cache-dir gdown && \
    rm -rf /var/lib/apt/lists/*

COPY recipe_recommender_requirements.txt .

RUN pip install --no-cache-dir -r recipe_recommender_requirements.txt

# Download NLTK data
RUN python -m nltk.downloader wordnet omw-1.4

# Copy code files first
COPY *.py .
COPY allergendataset.csv .

# Create data and canonical_db directories
RUN mkdir -p data canonical_db

# Download data files from Google Drive
# recipes.parquet - 1TKWfXVzCQ_Dx4_tMw3DbOs52B-0-YTDk
RUN echo "Downloading recipes.parquet..." && \
    gdown --id 1TKWfXVzCQ_Dx4_tMw3DbOs52B-0-YTDk -O data/recipes.parquet

# units.csv - 1BKsR476uvUeYPDVajuuxMnUo5RgSK-v_
RUN echo "Downloading units.csv..." && \
    gdown --id 1BKsR476uvUeYPDVajuuxMnUo5RgSK-v_ -O data/units.csv

# reviews.parquet - 19M4f3i2cBAZD-n4DDWwEV1UDKlwCPLTB
RUN echo "Downloading reviews.parquet..." && \
    gdown --id 19M4f3i2cBAZD-n4DDWwEV1UDKlwCPLTB -O data/reviews.parquet

# Verify files were downloaded
RUN ls -lh data/

EXPOSE 9001

CMD ["python", "recipe_recommender_server.py"]