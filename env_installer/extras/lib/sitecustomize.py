import os
import subprocess
import sys

need_installation = False
try:
    # This will raise CalledProcessError if mitosheet is not installed
    subprocess.check_output(["uv", "pip", "show", "mitosheet"], stderr=subprocess.DEVNULL)
    # We could also check the output to verify version if needed
except subprocess.CalledProcessError:
    need_installation = True

if os.environ.get("INSTALLING_MITO_STACK", "0") != "1" and need_installation:
    env = os.environ.copy()
    env["INSTALLING_MITO_STACK"] = "1"
    try:
        # Send output to stderr to avoid interfering with tool reading stdout
        print("Installing missing mito packages...", file=sys.stderr)
        subprocess.run(
            [
                "uv",
                "pip",
                "install",
                "--no-config",
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
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while installing packages: {e}", file=sys.stderr)
