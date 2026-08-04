#!/bin/bash
# Bulletproof dev server keepalive
cd /home/z/my-project

while true; do
  # Check if server is up
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null)
  
  if [ "$STATUS" != "200" ]; then
    # Kill any leftover processes
    pkill -f 'next dev' 2>/dev/null
    pkill -f 'node.*next' 2>/dev/null
    sleep 1
    # Start fresh
    rm -f dev.log
    nohup bun run dev >> /home/z/my-project/dev.log 2>&1 &
 disown
    # Wait for it to be ready
    for i in $(seq 1 30); do
      S=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null)
      if [ "$S" = "200" ]; then
        echo "$(date) - Server restarted" >> /home/z/my-project/keepalive.log
        break
      fi
      sleep 1
    done
  fi
  
  # Ping every 2 seconds to keep it alive
  sleep 2
done
