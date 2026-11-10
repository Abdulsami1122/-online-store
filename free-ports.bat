@echo off
echo Freeing port 5000 and 3000...
powershell -NoProfile -Command "$p5 = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess; if ($p5) { Stop-Process -Id $p5 -Force; Write-Host 'Stopped process on port 5000 (PID '$p5')' } else { Write-Host 'Port 5000 is already free' }"
powershell -NoProfile -Command "$p3 = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess; if ($p3) { Stop-Process -Id $p3 -Force; Write-Host 'Stopped process on port 3000 (PID '$p3')' } else { Write-Host 'Port 3000 is already free' }"
echo Done!
pause

