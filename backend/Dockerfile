FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN pip install poetry==0.12.17

ENV PIECEWISE_ENV="production"
ENV MODULE_NAME="piecewise.__main__"
ENV VARIABLE_NAME="app"

COPY . /app
WORKDIR /app/

# Set up poetry to not create a virtualenv, since the docker container is
# isolated already, and install the required dependencies.
RUN poetry config settings.virtualenvs.create false \
    && poetry install --no-dev --no-interaction --develop=piecewise

ENV PYTHONPATH=/app

EXPOSE 80
