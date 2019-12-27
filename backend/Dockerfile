FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN pip install poetry

ARG PIECEWISE_ENV="production"
ARG MODULE_NAME="piecewise.__main__"
ARG VARIABLE_NAME="app"

COPY . /app
WORKDIR /app/

ENV PYTHONPATH=/app

EXPOSE 80
