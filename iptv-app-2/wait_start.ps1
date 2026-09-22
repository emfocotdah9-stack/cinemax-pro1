while (True) { if (Test-Path 'node_modules\next\dist\server') { npm run dev; break; } Start-Sleep -Seconds 5; }  
