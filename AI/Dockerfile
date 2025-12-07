FROM python:3.11-slim

WORKDIR /app

COPY model1_requirements.txt .

RUN pip install --no-cache-dir -r model1_requirements.txt

COPY app/ ./

EXPOSE 9002

CMD ["python", "server.py"]