import pandas as pd
import matplotlib.pyplot as plt

# Carregar os dados do arquivo CSV
data = pd.read_csv('postgres_stats.csv')

# Converter a coluna de timestamp para o tipo datetime
data['timestamp'] = pd.to_datetime(data['timestamp'])

# Remover o símbolo de porcentagem e converter para float
data['cpu_usage'] = data['cpu_usage'].str.replace('%', '').astype(float)
data['memory_usage'] = data['memory_usage'].str.replace('%', '').astype(float)

# Plotar os dados
plt.figure(figsize=(12, 6))

# Gráfico de uso de CPU
plt.subplot(2, 1, 1)
plt.plot(data['timestamp'], data['cpu_usage'], label='CPU Usage (%)')
plt.xlabel('Timestamp')
plt.ylabel('CPU Usage (%)')
plt.title('CPU Usage Over Time')
plt.legend()

# Gráfico de uso de memória
plt.subplot(2, 1, 2)
plt.plot(data['timestamp'], data['memory_usage'], label='Memory Usage (%)', color='orange')
plt.xlabel('Timestamp')
plt.ylabel('Memory Usage (%)')
plt.title('Memory Usage Over Time')
plt.legend()

# Ajustar layout e mostrar o gráfico
plt.tight_layout()
plt.show()

# to run python with virtualenv
# $ python3 -m venv venv
# $ source venv/bin/activate
# $ pip install pandas matplotlib
# $ python plot_stats.py