---
date: {2025-11-12}
---

# Use uv to speed up first workspace installation

## Context and Problem Statement

On Windows, installing Mito desktop is very slow due to the creation of the initial workspace. It can take easily 15 minutes to open a notebook.

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
