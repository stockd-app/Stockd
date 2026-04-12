FROM python:3.11-slim

WORKDIR /app

# Install curl and latest gdown for downloading from Google Drive
RUN apt-get update && apt-get install -y curl && \
    pip install --no-cache-dir --upgrade gdown && \
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

# Download data files from Google Drive using --fuzzy flag for large files
# recipes.parquet - 1TKWfXVzCQ_Dx4_tMw3DbOs52B-0-YTDk
RUN echo "Downloading recipes.parquet..." && \
    gdown --fuzzy "https://drive.google.com/file/d/1TKWfXVzCQ_Dx4_tMw3DbOs52B-0-YTDk/view?usp=sharing" -O data/recipes.parquet

# units.csv - 1BKsR476uvUeYPDVajuuxMnUo5RgSK-v_
RUN echo "Downloading units.csv..." && \
    gdown --fuzzy "https://drive.google.com/file/d/1BKsR476uvUeYPDVajuuxMnUo5RgSK-v_/view?usp=drive_link" -O data/units.csv

# reviews.parquet - 19M4f3i2cBAZD-n4DDWwEV1UDKlwCPLTB
RUN echo "Downloading reviews.parquet..." && \
    gdown --fuzzy "https://drive.google.com/file/d/19M4f3i2cBAZD-n4DDWwEV1UDKlwCPLTB/view?usp=drive_link" -O data/reviews.parquet

# Verify files were downloaded and are valid
RUN ls -lh data/ && \
    echo "Checking file sizes..." && \
    test -s data/recipes.parquet && \
    test -s data/units.csv && \
    test -s data/reviews.parquet && \
    echo "✅ All data files downloaded successfully!"

EXPOSE 9001

CMD ["python", "recipe_recommender_server.py"]