DENO_DIR := $(PWD)/$(DENO_DIR)

all: install test

build:

clean:
	rm -rf node_modules

install:

node_modules/$(NPM_PACKAGE_NAME):
	$(NPM_LINK) $(NPM_PACKAGE_NAME)

test: node_modules/$(NPM_PACKAGE_NAME)
	deno test --allow-run --allow-env $(CACHE_OPTIONS) .

.PHONY: all build clean install link test unlink
