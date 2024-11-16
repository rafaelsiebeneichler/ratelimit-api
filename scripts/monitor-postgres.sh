#!/bin/bash

# Nome do container PostgreSQL
CONTAINER_NAME=postgres

# Arquivo CSV para salvar os dados
OUTPUT_FILE=postgres_stats.csv

# Intervalo de coleta de dados (em segundos)
INTERVAL=1

# Cabeçalho do arquivo CSV
echo "timestamp,cpu_usage,memory_usage" > $OUTPUT_FILE

# Função para coletar dados de CPU e memória
collect_stats() {
  while true; do
    TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)
    STATS=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemPerc}}" $CONTAINER_NAME)
    echo "$TIMESTAMP,$STATS" >> $OUTPUT_FILE
    sleep $INTERVAL
  done
}

# Iniciar a coleta de dados em segundo plano
collect_stats &
MONITOR_PID=$!

# Navegar até o diretório onde o arquivo de teste do K6 está localizado
cd .. 
cd test

sleep 10

# Executar os testes do K6
k6 run load-test-mock-data.js &
K6_PID=$!

# Esperar o K6 terminar
wait $K6_PID

sleep 10

# Finalizar a coleta de dados após o término dos testes do K6
kill $MONITOR_PID


# chmod +x monitor-postgres.sh ./monitor-postgres.sh