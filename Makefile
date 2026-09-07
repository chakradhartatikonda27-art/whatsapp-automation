.PHONY: seed test docker-up docker-down

seed:
	@echo "Seeding database..."
	@python3 apps/api/seed.py

test:
	@echo "Running automated test suite..."
	@PYTHONPATH=apps/api pytest tests/

docker-up:
	@echo "Starting Docker Compose services..."
	@docker-compose up --build -d

docker-down:
	@echo "Stopping Docker Compose services..."
	@docker-compose down
