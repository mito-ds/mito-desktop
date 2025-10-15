# Release Instructions

## Step 1: Versioning

To release a new major version of Mito Desktop, increment the major version in `package.json`.

## Step 2:Updating bundled packages

If you've updated the bundled packages installed in the enviornment, then we need to update the conda lock file and signing list. 

1. Update conda lock files using

   ```bash
   yarn update_conda_lock
   ```

2. If the command above updates lock files then run the commands below to update binary sign lists as well.

   ```bash
   yarn create_env_installer:osx-64 && yarn update_binary_sign_list --platform osx-64
   ```

   ```bash
   yarn create_env_installer:osx-arm64 && yarn update_binary_sign_list --platform osx-arm64
   ```

## Step 3: Commit your changes
Now, create a new PR branch and commit your changes. This is going to be the branch that we use for the release. 

## Step 4: Run the GitHub Actions

1. Run prerelease.yml → Create a new release on GitHub as `pre-release`. Set the release `tag` to the value of target application version and prefix it with `v` (for example `v1.0.0-1` for Mito Desktop version `1.0.0-1`). Release needs to stay as `pre-release` for GitHub Actions to be able to attach installers to the release.

2. Double check the installers are working by following the [distribution build instructions](dev.md#building-for-distribution) locally


3. Run releasepr.yml → Creates a PR from release-v{version} branch


4. Merge the PR into master → This triggers publish.yml automatically. This will build signed installers and upload them as release assets. Assets will be uploaded only if a release of type `pre-release` with tag matching the Mito Desktop's version with a `v` prefix is found. New commits to PR will overwrite the installer assets of the release.

5. Change the release from `pre-release` to `release`


