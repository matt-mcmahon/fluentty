TSFILES:=$(patsubst %.mk,%.ts,$(wildcard *.mk))

build: $(TSFILES) format

clean:
	rm -rf $(TSFILES)

test:
	# nothing

format: $(TSFILES)
	deno fmt $(TSFILES)

%.ts: %.mk
	deno run \
		--allow-write=$(CURDIR)/$@ \
		--allow-read=$(CURDIR) \
		../text-file-to-module.ts \
		$(CURDIR)/$@ \
		$(CURDIR)/$<

.PHONY: build clean format
