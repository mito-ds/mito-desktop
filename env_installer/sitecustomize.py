import os
import subprocess
import sys


# This scripts is used to install the missing mito packages into the system environment.
# It is called by the JupyterLab Desktop Server installer. The build step copies this 
# script into the env_installer/jlab_server/.../site-packages/ so it only runs 
# when this bundled environment is used, not the users's system python or other environments.
env = os.environ.copy()
if env.get("CHECKING_MITO_STACK", "0") != "1":
    env["CHECKING_MITO_STACK"] = "1"
    try:
        # This will raise CalledProcessError if mitosheet is not installed
        subprocess.check_output(["uv", "pip", "show", "--system", "mitosheet"], env=env, stderr=subprocess.DEVNULL)
        # We could also check the output to verify version if needed
    except subprocess.CalledProcessError:
        try:
            # Send output to stderr to avoid interfering with tool reading stdout
            print("Installing missing mito packages...", file=sys.stderr)
            subprocess.run(
                [
                    "uv",
                    "pip",
                    "install",
                    "--no-config",
                    "--system",  # Required for conda environments which uv doesn't recognize as venvs
                    # "--quiet",  # Uncomment to silence uv logs
                    "mito-ai",
                    "mitosheet",
                    "ipympl>=0.8.2",
                    "ipywidgets>=8.0.1",
                    "jupyterlab==4.4.6",
                    "matplotlib==3.9.2",
                    "numpy==2.1.*",
                    "pandas"
                ],
                check=True,
                env=env
            )
        except (FileNotFoundError, OSError) as e:
            # sitecustomize.py runs on every Python startup; if `uv` is not available,
            # we must not crash the interpreter.
            print(f"Skipping mito package install because `uv` is not available: {e}", file=sys.stderr)
        except subprocess.CalledProcessError as e:
            print(f"An error occurred while installing packages: {e}", file=sys.stderr)
    except (FileNotFoundError, OSError) as e:
        # `uv` missing or not executable (e.g. not on PATH). Fail gracefully.
        print(f"Skipping mito package check because `uv` is not available: {e}", file=sys.stderr)
