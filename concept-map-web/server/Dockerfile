# Inherit from the custom base image
FROM ehrqc:latest  

WORKDIR /home/backend_user

COPY requirements.txt .
RUN python -m venv /home/EHRQC/.venv
RUN /home/EHRQC/.venv/bin/pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PATH="/home/EHRQC/.venv/bin:$PATH"

CMD ["python", "app.py"]