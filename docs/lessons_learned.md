## Slowness of the session initialization on Windows

The installation of the initial session on Windows is really long (about 15minutes). Here are the results of the investigation.

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
