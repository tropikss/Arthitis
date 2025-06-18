# Transférer tous les fichiers .py vers l'ESP32
Get-ChildItem -Filter *.py | ForEach-Object {
    mpremote fs cp $_.FullName :
}

# Lancer main.py sur l'ESP32
mpremote run main.py

# powershell -ExecutionPolicy Bypass -File .\run.ps1
