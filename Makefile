# Include, then immediately export, environment variables in .env file.
# These variables will be available to the Deno CLI.
include .env
export

# These settings can be safely disabled by setting the VARIABLE_NAME to nothing
# in your deployment's .env file. For example, setting the following would
# disable the local Deno cache in favor of Deno's global cache:
#
# DENO_DIR=
#
DENO_BUNDLE_FILE       ?= configure.js
DENO_DEPENDENCIES_FILE ?= dependencies.ts
DENO_DIR               ?= .deno
DENO_MAIN              ?= module.ts
DENO_SOURCE_DIR        ?= source
IMPORT_MAP             ?=
LOCK_FILE              ?= lock_file.json
NPM                    ?= npm
RUN_PERMISSIONS        ?=
TEST_PERMISSIONS       ?= --allow-run --allow-read --allow-write
USE_CACHE              ?= --cached-only
USE_UNSTABLE           ?= --unstable

# The default values for these settings are meant to be easily overwritten by
# your project's .env file.
#
# Do NOT set these values to nothing.
#
DENO_DIR_ABS           := $(PWD)/$(DENO_DIR)

GEN_DIR                ?= /dev/null

REMOTE_DIRS            := remote

LINT_FILES             := $(shell find "$(DENO_SOURCE_DIR)"  -type f -name "*.ts" -not -name "*.test.ts")
REMOTE_DEPENDENCIES    := $(shell find "$(REMOTE_DIRS)"      -type f -name "*.ts")
SOURCE_FILES           := $(shell find "$(DENO_SOURCE_DIR)"  -type f -name "*.ts")

OPTIONAL_EXTENSIONS    := (\.d.ts)|(\.ts)|(\.js)

ifneq ($(IMPORT_MAP),)
IMPORT_MAP_OPTIONS     := --importmap $(IMPORT_MAP)
USE_UNSTABLE           := --unstable
endif

ifneq ($(LOCK_FILE),)
LOCK_OPTIONS           := --lock $(LOCK_FILE)
LOCK_OPTIONS_WRITE     := --lock $(LOCK_FILE) --lock-write
endif

define print_header
	@echo
	@echo $1
	@echo
endef

all: install lint build test-all
	$(MAKE) DENO_DIR=$(DENO_DIR_ABS) -C source/makefiles all

ifneq ($(LOCK_FILE),)
$(LOCK_FILE): $(REMOTE_DEPENDENCIES) $(DENO_DEPENDENCIES_FILE)
	@read -p \
		"Dependencies have changed. Press [Enter] to update the cache and $(LOCK_FILE), or [Ctrl]+[C] to cancel:" \
		cancel
ifneq ($(RELOAD),)
	@echo "Deleting $(DENO_DIR)..."
	rm -rf $(DENO_DIR)
endif
	deno cache --unstable \
		$(RELOAD) \
		$(RUN_PERMISSIONS) \
		$(LOCK_OPTIONS_WRITE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_DEPENDENCIES_FILE)
endif

ifneq ($(DENO_BUNDLE_FILE),)
$(DENO_BUNDLE_FILE): $(LINT_FILES)
	@echo "// deno-fmt-ignore-file"   > $(DENO_BUNDLE_FILE)
	@echo "// deno-lint-ignore-file" >> $(DENO_BUNDLE_FILE)
	@echo "// @ts-nocheck"           >> $(DENO_BUNDLE_FILE)
	deno bundle \
		$(IMPORT_MAP_OPTIONS) \
		$(USE_UNSTABLE) \
		$(DENO_MAIN) \
		>> $(DENO_BUNDLE_FILE)
endif

ifneq ($(DENO_DEPENDENCIES_FILE),)
$(DENO_DEPENDENCIES_FILE): $(REMOTE_DEPENDENCIES)
	$(file > $(DENO_DEPENDENCIES_FILE),$(patsubst %,import "./%";,$(REMOTE_DEPENDENCIES)))
	deno fmt $(DENO_DEPENDENCIES_FILE)
endif

build: .header(build) $(DENO_BUNDLE_FILE)
	$(MAKE) TARGET=$@ do-platform-action
	$(MAKE) TARGET=$@ do-integration-action

clean: .header(clean)
	$(MAKE) TARGET=$@ do-platform-action
	$(MAKE) TARGET=$@ do-integration-action

configure:
	./configure

fmt: format

format:
	deno fmt $(DENO_SOURCE_DIR)

.header(build):
	$(call print_header, Building...)

.header(clean):
	$(call print_header, Cleaning...)

.header(install):
	$(call print_header, Installing...)

.header(test):
	$(call print_header, Testing...)

install: .header(install) $(LOCK_FILE)

lint:
	deno fmt --check $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)
	-deno lint --unstable $(RUN_PERMISSIONS) $(LINT_FILES)

lint-quiet:
	deno fmt --quiet --check $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)
	-deno lint --quiet --unstable $(RUN_PERMISSIONS) $(LINT_FILES)

run:
	deno run $(RUN_PERMISSIONS) $(DENO_MAIN)

test: .header(test) $(LOCK_FILE)
	deno test --unstable --coverage \
		$(TEST_PERMISSIONS) \
		$(LOCK_OPTIONS) \
		$(USE_CACHE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_SOURCE_DIR)

test-all: .header(test) test

test-quiet: .header(test) $(LOCK_FILE)
	deno test --unstable --failfast --quiet \
		$(TEST_PERMISSIONS) \
		$(LOCK_OPTIONS) \
		$(USE_CACHE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_SOURCE_DIR)

test-watch: .header(test)
	while inotifywait -e close_write $(DENO_SOURCE_DIR); do make test; done

upgrade:
	$(MAKE) --always-make RELOAD=--reload $(LOCK_FILE)

.PHONY: \
	all \
	build \
	clean configure \
	deno \
	do-platform-action do-integration-action \
	fmt format \
	.header(build) .header(clean) .header(install) .header(test) \
	install \
	lint lint-quiet \
	run \
	test test-quiet test-watch
