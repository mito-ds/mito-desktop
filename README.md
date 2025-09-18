# Mito Desktop

Mito Desktop is the cross-platform desktop application for [Mito](https://github.com/mito-ds/mito). It is the quickest and easiest way to get started with Mito on your computer.

![Mito Desktop](media/jupyterlab-desktop.png)

## Installation

Install Mito Desktop using one of the methods listed below for your system.

| Windows (10, 11)                                                                                                            | Mac (macOS 10.15+)                                                                                                                            | Linux                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [x64 Installer](https://github.com/mito-ds/mito-desktop/releases/latest/download/Mito-Setup-Windows-x64.exe) | [arm64 Installer (Apple silicon)](https://github.com/mito-ds/mito-desktop/releases/latest/download/Mito-Setup-macOS-arm64.dmg) | [.deb x64 Installer (Debian, Ubuntu)](https://github.com/mito-ds/mito-desktop/releases/latest/download/Mito-Setup-Debian-x64.deb)                                                                                     |
|                                                                                                                             | [x64 Installer (Intel chip)](https://github.com/mito-ds/mito-desktop/releases/latest/download/Mito-Setup-macOS-x64.dmg)        | [.rpm x64 Installer (Red Hat, Fedora, SUSE)](https://github.com/mito-ds/mito-desktop/releases/latest/download/Mito-Setup-Fedora-x64.rpm)        |
|                                                                                                                             |                                                                                                                                           

If you need to remove a previous Mito Desktop installation, please follow the [uninstall instructions](user-guide.md#uninstalling-jupyterlab-desktop).

## Launching Mito Desktop

Mito Desktop can be launched from the GUI of your operating system by clicking the application's icon or by using `jlab` command from the command line. Double clicking `.ipynb` files is also supported and it will launch Mito Desktop and load the notebook file.

Mito Desktop sets File Browser's root directory based on the launch method.

- If launched from the application icon on GUI or by using `jlab` command without any arguments, then the default working directory is set as the root directory. The default working directory is user home directory but it can be customized from the Settings dialog.
- If launched by double clicking `.ipynb` file or `jlab` command with a file path as the argument, then file's parent directory is set as the root directory. Similarly, if a file is opened using the `Open...` or `Open File...` links in the Start section or by using drag & drop, then file's parent directory is set as the root directory.
- If `jlab` command is used with a directory path as the argument or with the `--working-dir` argument then the directory in the argument is set as the root directory. Similarly, if a folder is opened using the `Open Folder...` link in the Start section or by using drag & drop, then the opened directory is set as the root directory

## Sessions and Projects

Sessions represent local project launches and connections to existing JupyterLab servers. Each JupyterLab UI window in the app is associated with a separate session and sessions can be restored with the same configuration later on.

Each launch of JupyterLab in a different working directory is a separate project and projects can have their own configuration such as Python environment and UI layout.

### jlab command-line launch examples

- Open directories using relative or absolute path
  - `jlab .` launch in current directory
  - `jlab ../notebooks` launch with relative path
  - `jlab /Users/username/notebooks` launch with absolute path
- Open notebooks and other files using relative or absolute path
  - `jlab /Users/username/notebooks/test.ipynb` launch notebook with absolute path
  - `jlab ../notebooks/test.ipynb` launch notebook with relative path
  - `jlab ../test.py` launch python file with relative path
- Open with a custom Python environment
  - `jlab --python-path /Users/username/custom_env/bin/python ../notebooks/test.ipynb` launch notebook with custom Python environment
- Connect to existing JupyterLab server
  - `jlab https://example.org/lab?token=abcde`

See [CLI documentation](cli.md) for more CLI commands and options.

### JupyterLab Extension support

Mito Desktop currently supports user-friendly [prebuilt](https://jupyterlab.readthedocs.io/en/stable/extension/extension_dev.html#overview-of-extensions) extensions. Source extensions which require rebuilding are not supported.

### Guides and Help

- See [user guide](user-guide.md) for configuration options

- [Python environment management](python-env-management.md) guide for managing Python environments on your system using JupyterLab Desktop

- See [CLI documentation](cli.md) for CLI commands and options

- See [troubleshooting guide](troubleshoot.md) for troubleshooting issues

- For contributing, see [developer documentation](dev.md)
