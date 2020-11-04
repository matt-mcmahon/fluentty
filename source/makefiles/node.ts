export default 'DEVELOPMENT_FILES := $(shell find "$(PWD)/$(DENO_SOURCE_DIR)" -type f -name "*.ts")\nGEN_DIR           := $(CURDIR)/source/gen\n\nall: install test build\n\n$(GEN_DIR): $(DEVELOPMENT_FILES)\n\t$(MAKE) GEN_DIR=$(GEN_DIR) -C $(PWD) $(GEN_DIR)\n\nbuild: $(GEN_DIR)\n\trm -rf build\n\t$(NPM_RUN) build-production\n\t$(NPM_LINK)\n\nclean:\n\t-$(NPM_UNLINK)\n\trm -rf .npmignore .nyc_output build node_modules $(GEN_DIR) test-build\n\ninstall:\n\t$(NPM_INSTALL)\n\ntest: test-build\n\t$(NPM_RUN) test\n\ntest-build: $(GEN_DIR)\n\trm -rf test-build\n\t$(NPM_RUN) build-development\n\n.PHONY: all clean install test\n';
