DEVELOPMENT_FILES := $(shell find "$(PWD)/$(DENO_SOURCE_DIR)" -type f -name "*.ts")
GEN_DIR           := $(CURDIR)/source/gen

all: install test build

$(GEN_DIR): $(DEVELOPMENT_FILES)
	$(MAKE) GEN_DIR=$(GEN_DIR) -C $(PWD) $(GEN_DIR)

build: $(GEN_DIR)
	rm -rf build
	$(NPM_RUN) build-production
	$(NPM_LINK)

clean:
	-$(NPM_UNLINK)
	rm -rf .npmignore .nyc_output build node_modules $(GEN_DIR) test-build

install:
	$(NPM_INSTALL)

test: test-build
	$(NPM_RUN) test

test-build: $(GEN_DIR)
	rm -rf test-build
	$(NPM_RUN) build-development

.PHONY: all clean install test
