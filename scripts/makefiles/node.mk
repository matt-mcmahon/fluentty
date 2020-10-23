PRODUCTION_FILES  := $(shell find "source/gen/" -type f -name "*.ts" -not -name "*.test.ts")
DEVELOPMENT_FILES := $(shell find "source/gen/" -type f -name "*.ts")

GEN_DIR := $(CURDIR)/source/gen

all: install test dist

build: dist

$(DEVELOPMENT_FILES): source/gen

source/gen: $(DENO_SOURCE_DIR)
	$(MAKE) GEN_DIR=$(GEN_DIR) -C ../../ $(GEN_DIR)

clean:
	-$(NPM_UNLINK)
	rm -rf node_modules test-build .nyc_output dist source/gen .npmignore

dist: source/gen $(PRODUCTION_FILES)
	rm -rf dist
	$(NPM_RUN) build-production
	$(NPM_LINK)

install:
	$(NPM_INSTALL)

test: test-build
	$(NPM_RUN) test

test-build: $(DEVELOPMENT_FILES)
	rm -rf test-build
	$(NPM_RUN) build-development

.PHONY: all build clean install test source/gen
