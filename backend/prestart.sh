#! /usr/bin/env bash

# Let the DB start
sleep 10
# Dependencies workaround
pip install pyparsing attrs importlib-metadata requests
# Run migrations
poetry run alembic upgrade head
