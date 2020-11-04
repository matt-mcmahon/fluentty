TSFILES:=$(patsubst %.mk,%.ts,$(wildcard *.mk))

all: $(TSFILES)

clean:
	rm -rf $(TSFILES)

%.ts: %.mk
	deno run \
		--allow-write=$(CURDIR)/$@ \
		--allow-read=$(CURDIR) \
		../text-file-to-module.ts \
		$(CURDIR)/$@ \
		$(CURDIR)/$<
	deno fmt .

.PHONY: clean all
