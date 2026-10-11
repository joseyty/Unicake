@echo off
rem Liga a API da UniCake (compras, pagamentos e area do confeiteiro).
rem Deixe esta janela aberta enquanto usa o site.
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Ambiente Python nao encontrado em backend\.venv.
  echo Crie com: py -V:3.14 -m venv .venv  e depois  .venv\Scripts\python -m pip install -r requirements.txt
  pause
  exit /b 1
)
echo API da UniCake em http://127.0.0.1:5000  -  feche esta janela para desligar.
".venv\Scripts\python.exe" api.py
pause
