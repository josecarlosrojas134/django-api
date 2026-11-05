# Levanta backend y frontend en dos ventanas separadas.
# Uso: .\dev.ps1
#
# Hace la puesta en marcha completa si hace falta:
#   1. Copia .env.example a .env si no existe (SQLite por defecto: sin instalar nada).
#   2. uv sync
#   3. migrate
#   4. seed_demo (datos de ejemplo; idempotente)
#   5. npm install en frontend/ si falta node_modules
# Después levanta backend y frontend en dos ventanas.

$root = $PSScriptRoot

Write-Host "1/5 Comprobando .env…" -ForegroundColor DarkGray
if (-not (Test-Path "$root\.env")) {
    Copy-Item "$root\.env.example" "$root\.env"
    Write-Host "   .env creado desde .env.example (base SQLite local)." -ForegroundColor DarkYellow
} else {
    Write-Host "   .env ya existe." -ForegroundColor DarkGray
}

Write-Host "2/5 uv sync…" -ForegroundColor DarkGray
uv sync

Write-Host "3/5 migrate…" -ForegroundColor DarkGray
uv run python manage.py migrate

Write-Host "4/5 seed_demo…" -ForegroundColor DarkGray
uv run python manage.py seed_demo

Write-Host "5/5 frontend: dependencias…" -ForegroundColor DarkGray
if (-not (Test-Path "$root\frontend\node_modules")) {
    Push-Location "$root\frontend"
    npm install
    Pop-Location
} else {
    Write-Host "   node_modules ya existe." -ForegroundColor DarkGray
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; uv run python manage.py runserver"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
