---
date: {2025-11-12}
---

# Use uv to speed up first workspace installation

## Context and Problem Statement

The installation of the initial session on Windows is really long (about 15minutes).

> All time reported are for information and specific to the test machine used.

The session is a conda environment distributed through an archive file packaged using `conda-pack`. The installation process
has two folds:
- Uncompressing the file: the tar.gz archive uncompression takes about 5 minutes
- Executing conda unpack: it takes about 8 minutes

The second step is needed in particular to fix the executable files generated from script entry points that may stored
inappropriate absolute path.

Then different tests to create an environment were performed:
- New conda environment from the lock file used by conda-pack: 8 minutes
- New conda environment from environment specs (require resolution): 9-10 minutes
- New uv environment from environment specs (require resolution): < 1 minute
- New uv environment from lock file: < 1 minute

<!-- This is an optional element. Feel free to remove. -->
## Decision Drivers

1. We want the installation process to be faster for Windows users!
2. We don't care if the installation process requires an internet connection.
3. It would be nice to continue shipping Python so users don't need to install it on their own
4. We'd like pip to continue working in the notebook so users can `!pip install X`
5. We don't care if the Jupyter Desktop CLI breaks unless its required for the Jupyter Desktop UI to work

## Considered Options

* Use conda directly to create the environment instead of unpacking a conda environment
* Use uv within the packed conda environment
* Drop conda in favor of uv

## Decision Outcome

We picked the second option - using uv within the packed conda environment - as it has the less side effect while improving a lot the bootstrap time.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because the boostrap time even on Windows is reduced to few minutes.
* Bad, because we are mixing two Python packages manager. This is likely inefficient on the long run and only uv should be kept. But this will require more work especially as the Mito desktop inherit a CLI from JupyterLab desktop that relies on conda.

### Confirmation

The new installation process has been validated on the 3 OS: Windows, Linux and MacOS.

## Pros and Cons of the Options

### Create a conda environment from scratch

Installing a conda environment from scratch - aka here from a lock file - demonstrates faster runtime than installing the environment from a packed environment. But this is still pretty slow on Windows.

### Bootstrap the conda environment with uv

* Good, because dramatically reduce the installation time
* Good, because keep the ability to install packages using `pip install ...`
* Neutral, because we keep the distribution within a conda packed environment
* Bad, because we use two Python package managers within the same environment - they may not play nicely with each other on the long term
* Bad, because we have to validate the environment at each Python interpreter execution as it is done using `sitecustomize.py`.
