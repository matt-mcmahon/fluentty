# Include, then immediately export, environment variables in .env file.
# These variables will be available to the Deno CLI.
ifneq ($(wildcard .env),)
include .env
endif

export

# These settings can be safely disabled by setting the VARIABLE_NAME to nothing
# in your deployment's .env file. For template, setting DENO_DIR as the below
# will project's local Deno cache in favor of Deno's global cache. If you delete
# the `DENO_DIR=` line instead, the .env file would NOT disable the cache, and
# instead use the default value, `.deno`.
#
# DENO_DIR=
#
DENO_BUNDLE_FILE       ?= bundle.js
DENO_DEPENDENCIES_FILE ?= dependencies.ts
DENO_DIR               ?= .deno
DENO_MAIN              ?= module.ts
DENO_SOURCE_DIR        ?= source
REMOTE_DIRS            ?= remote
IMPORT_MAP             ?= import_map.json
LOCK_FILE              ?= lock_file.json
NPM                    ?= npm
RUN_PERMISSIONS        ?=
TEST_PERMISSIONS       ?=
USE_UNSTABLE           ?=

# Not directly configurable:
DENO_DIR_ABS           := $(PWD)/$(DENO_DIR)
GEN_DIR                := /dev/null
OPTIONAL_EXTENSIONS    := (\.d.ts)|(\.ts)|(\.js)
PRODUCTION_FILES       := $(shell find "$(DENO_SOURCE_DIR)"  -type f -name "*.ts" -not -name "*.test.ts")
REMOTE_DEPENDENCIES    := $(shell find "$(REMOTE_DIRS)"      -type f -name "*.ts")
SOURCE_FILES           := $(shell find "$(DENO_SOURCE_DIR)"  -type f -name "*.ts")

ifneq ($(wildcard $(IMPORT_MAP)),)
IMPORT_MAP_OPTIONS     := --importmap $(IMPORT_MAP)
USE_UNSTABLE           := --unstable
else
undefine IMPORT_MAP
undefine IMPORT_MAP_OPTIONS
endif

ifneq ($(DENO_DIR),)
USE_CACHE              ?= --cached-only
else
USE_CACHE              ?=
endif

ifneq ($(LOCK_FILE),)
LOCK_OPTIONS           := --lock $(LOCK_FILE)
LOCK_OPTIONS_WRITE     := --lock $(LOCK_FILE) --lock-write
endif

define print-header
	@echo
	@echo $1 $(CURDIR)
	@echo
endef

all: install lint test build

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
$(DENO_BUNDLE_FILE): $(PRODUCTION_FILES) $(REMOTE_DEPENDENCIES)
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

build: .print-build-header $(DENO_BUNDLE_FILE)
	$(call MakeTemplate, install build)

clean: .print-clean-header
	rm -f $(DENO_BUNDLE_FILE)

configure:
	./configure

fmt: format

format:
	deno fmt $(DENO_SOURCE_DIR)

install: .print-install-header $(LOCK_FILE)

lint:
	deno fmt --check $(DENO_SOURCE_DIR)
	-deno lint --unstable $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)

lint-quiet:
	deno fmt --quiet --check $(DENO_SOURCE_DIR)
	-deno lint --quiet --unstable $(RUN_PERMISSIONS) $(DENO_SOURCE_DIR)

run:
	deno run $(RUN_PERMISSIONS) $(DENO_MAIN)

test: .print-test-header $(LOCK_FILE)
	deno test --unstable \
		$(TEST_PERMISSIONS) \
		$(LOCK_OPTIONS) \
		$(USE_CACHE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_SOURCE_DIR)

test-coverage: .print-test-header $(LOCK_FILE)
	deno test --unstable --coverage \
		$(TEST_PERMISSIONS) \
		$(LOCK_OPTIONS) \
		$(USE_CACHE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_SOURCE_DIR)

test-quiet: .print-test-header $(LOCK_FILE)
	deno test --unstable --failfast --quiet \
		$(TEST_PERMISSIONS) \
		$(LOCK_OPTIONS) \
		$(USE_CACHE) \
		$(IMPORT_MAP_OPTIONS) \
		$(DENO_SOURCE_DIR)

test-watch: .print-test-header
	while inotifywait -e close_write $(DENO_SOURCE_DIR); do make test; done

upgrade:
	$(MAKE) --always-make RELOAD=--reload $(LOCK_FILE)

.print-build-header:
	$(call print-header, Building: )

.print-clean-header:
	$(call print-header, Cleaning: )

.print-install-header:
	$(call print-header, Installing: )

.print-test-header:
	$(call print-header, Testing: )

.PHONY: \
	all \
	build \
	clean configure \
	fmt format \
	.print-build-header .print-clean-header .print-install-header .print-test-header \
	install \
	lint lint-quiet \
	run \
	test test-all test-coverage test-quiet test-watch \
	upgrade
