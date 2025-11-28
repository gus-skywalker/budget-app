# 🤖 Prompt de Melhorias com IA - Sistema de Orçamento Pessoal

## 📋 Contexto da Aplicação

### Stack Tecnológica Atual
- **Backend:** Java Spring Boot
- **Frontend:** Vue.js 3 + Vuetify
- **Banco de Dados:** PostgreSQL
- **Arquitetura:** REST API

### Entidades Principais
1. **Income (Receitas)**
   - Campos: id, date, amount, description, paymentMethod, isRecurring
   - Relacionamentos: User, PaymentMethod

2. **Expense (Despesas)**
   - Campos: id, date, amount, description, category, paymentMethod
   - Relacionamentos: User, Category, PaymentMethod, Group, Attachments, Alerts
   - Compartilhamento entre usuários via Groups

3. **Category (Categorias)**
   - Predefinidas: groceries, utilities, transportation, entertainment, healthcare, education, dining_out, travel, clothing, home_maintenance, gifts, charity, subscriptions, miscellaneous
   - Suporte a i18n (PT/EN)

4. **PaymentMethod (Métodos de Pagamento)**
   - Tipos: credit_card, debit_card, bank_transfer, cash, pix, etc.

5. **Alert (Alertas)**
   - Notificações personalizadas por despesa
   - Configurações: daysBefore, isRecurring, recurrenceInterval, recurrenceEndDate

### Funcionalidades Existentes
- ✅ Gestão de receitas e despesas
- ✅ Categorização manual
- ✅ Relatórios (PDF/XLSX) com 3 visualizações:
  - Normal (linha a linha)
  - Agrupado por mês
  - Detalhado por mês
- ✅ Alertas personalizados por despesa
- ✅ Compartilhamento de despesas em grupos
- ✅ Anexo de comprovantes
- ✅ Filtros por período e categoria
- ✅ Histórico temporal (2020-2026)

---

## 🎯 Objetivo da IA

Transformar a aplicação em um **assistente financeiro inteligente** que:
1. Antecipa necessidades do usuário
2. Fornece insights acionáveis
3. Reduz esforço manual (categorização, alertas)
4. Aumenta conscientização financeira
5. Gera economia real mensurável

---

## 💡 Funcionalidades Prioritárias (MVP de IA)

### 1️⃣ Previsão Inteligente de Gastos
**Problema resolvido:** Usuários não sabem quanto vão gastar no próximo mês.

**Solução:**
- Analisar histórico de 6+ meses por categoria
- Prever gastos futuros com intervalo de confiança
- Identificar tendências (aumento/redução/estabilidade)

**Endpoint:**
```http
POST /api/ai/predictions/monthly-expenses
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "string",
  "categoryId": 1,
  "forecastMonths": 3
}
```

**Response:**
```json
{
  "predictions": [
    {
      "month": "2025-12",
      "category": {
        "id": 1,
        "code": "groceries",
        "name": "Compras"
      },
      "predictedAmount": 1250.50,
      "confidence": 0.87,
      "historicalAverage": 1180.00,
      "trend": "increasing",
      "minExpected": 1100.00,
      "maxExpected": 1400.00
    }
  ],
  "totalPredicted": 2530.50,
  "modelAccuracy": 0.89
}
```

**Algoritmo sugerido:**
- Regressão linear com sazonalidade (Holt-Winters)
- Ou Prophet (Facebook) para séries temporais
- Treinar modelo individual por usuário + categoria

---

### 2️⃣ Detecção de Anomalias em Tempo Real
**Problema resolvido:** Gastos fora do padrão passam despercebidos.

**Solução:**
- Calcular média e desvio padrão por categoria/mês
- Alertar quando gasto excede 1.5x ou 2x o padrão
- Sugerir revisão de despesas específicas

**Endpoint:**
```http
GET /api/ai/anomalies?userId={id}&month=2025-11
Authorization: Bearer {token}
```

**Response:**
```json
{
  "month": "2025-11",
  "anomalies": [
    {
      "expense": {
        "id": "uuid-123",
        "date": "2025-11-15",
        "amount": 450.00,
        "description": "Uber/Taxi",
        "category": {
          "id": 3,
          "code": "transportation",
          "name": "Transporte"
        }
      },
      "expectedRange": {
        "min": 150.00,
        "max": 300.00,
        "average": 225.00
      },
      "deviation": 2.5,
      "severity": "high",
      "suggestion": "Você gastou 100% acima do normal em transporte. Considere usar transporte público ou carona."
    }
  ],
  "totalAnomalies": 1,
  "potentialSavings": 150.00
}
```

**Algoritmo sugerido:**
- Z-score (estatística básica)
- Isolation Forest (ML para outliers)

---

### 3️⃣ Recomendações Personalizadas de Economia
**Problema resolvido:** Usuários não sabem onde cortar gastos.

**Solução:**
- Identificar categorias com maior potencial de economia
- Comparar com média de usuários similares (anonimizado)
- Sugerir ações concretas baseadas em padrões

**Endpoint:**
```http
GET /api/ai/savings-recommendations?userId={id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "recommendations": [
    {
      "category": {
        "id": 7,
        "code": "dining_out",
        "name": "Alimentação Fora"
      },
      "currentMonthlyAverage": 800.00,
      "suggestedTarget": 600.00,
      "potentialMonthlySavings": 200.00,
      "annualImpact": 2400.00,
      "confidence": 0.82,
      "actionItems": [
        "Reduza pedidos de delivery de 16x para 12x/mês (-25%)",
        "Substitua 2 almoços fora por marmita caseira",
        "Use cupons de desconto em apps (iFood, Rappi)"
      ],
      "benchmarkComparison": {
        "yourAverage": 800.00,
        "similarUsersAverage": 550.00,
        "percentageAbove": 45
      }
    }
  ],
  "totalPotentialMonthlySavings": 250.00,
  "totalAnnualImpact": 3000.00
}
```

**Algoritmo sugerido:**
- Clusterização (K-means) para agrupar usuários similares
- Análise de frequência de despesas
- Regras de negócio configuráveis

---

### 4️⃣ Categorização Automática com Machine Learning
**Problema resolvido:** Categorizar manualmente cada despesa é tedioso.

**Solução:**
- Treinar modelo com histórico de categorizações do usuário
- Sugerir categoria ao criar nova despesa
- Aprender continuamente com correções do usuário

**Endpoint:**
```http
POST /api/ai/categorize
Content-Type: application/json
Authorization: Bearer {token}

{
  "description": "Compra Supermercado Pão de Açúcar",
  "amount": 150.00,
  "paymentMethod": 3
}
```

**Response:**
```json
{
  "suggestedCategory": {
    "id": 1,
    "code": "groceries",
    "name": "Compras",
    "confidence": 0.94
  },
  "alternativeCategories": [
    {
      "id": 14,
      "code": "miscellaneous",
      "name": "Outros",
      "confidence": 0.04
    }
  ],
  "reasoning": "Palavras-chave detectadas: 'supermercado', 'compra'. Padrão similar a 87% das despesas em 'Compras'."
}
```

**Fluxo de Treinamento:**
```http
POST /api/ai/learn-categorization
{
  "description": "...",
  "amount": 150.00,
  "paymentMethod": 3,
  "confirmedCategory": 1,
  "userId": "..."
}
```

**Algoritmo sugerido:**
- Naive Bayes (rápido, eficiente para texto)
- TF-IDF + Logistic Regression
- Embedding de descrições com BERT (avançado)

---

### 5️⃣ Insights de Fluxo de Caixa Preditivo
**Problema resolvido:** Usuários não antecipam déficits/superávits.

**Solução:**
- Projetar receitas e despesas futuras
- Alertar sobre meses com saldo negativo
- Sugerir ajustes preventivos

**Endpoint:**
```http
GET /api/ai/cashflow-insights?userId={id}&months=6
Authorization: Bearer {token}
```

**Response:**
```json
{
  "currentBalance": 3500.00,
  "forecast": [
    {
      "month": "2025-12",
      "predictedIncome": 5000.00,
      "predictedExpenses": 4200.00,
      "projectedBalance": 4300.00,
      "status": "surplus"
    },
    {
      "month": "2026-03",
      "predictedIncome": 5000.00,
      "predictedExpenses": 5350.00,
      "projectedBalance": 4150.00,
      "status": "deficit",
      "alert": {
        "severity": "warning",
        "message": "Possível déficit de R$ 350. Reduza despesas ou aumente receitas.",
        "suggestions": [
          "Corte R$ 200 em 'Alimentação Fora'",
          "Adie compra de 'Roupas' (R$ 300) para abril"
        ]
      }
    }
  ],
  "averageMonthlyBalance": 4316.67
}
```

**Algoritmo sugerido:**
- Média móvel de receitas (receitas fixas + variáveis)
- Soma de previsões de despesas (funcionalidade #1)
- Simulação Monte Carlo para cenários otimista/pessimista

---

## 🏗️ Arquitetura Proposta

### Opção 1 - Microserviço Python (Recomendado para MVP)
```
┌─────────────────────────────────────┐
│   Spring Boot App (Main Backend)   │
│   - REST API (/api/incomes, etc)   │
│   - PostgreSQL                      │
└──────────────┬──────────────────────┘
               │
               │ HTTP REST
               ▼
┌─────────────────────────────────────┐
│   AI Microservice (Python FastAPI) │
│   - ML Models (scikit-learn)        │
│   - Redis (cache de previsões)      │
│   - Celery (treinamento assíncrono) │
└─────────────────────────────────────┘
```

### Opção 2 - Tudo em Java
```
Spring Boot App
├── /api/incomes
├── /api/expenses
└── /api/ai/
    ├── predictions
    ├── anomalies
    ├── recommendations
    ├── categorize
    └── cashflow-insights

Libs Java:
- Weka ou Smile (ML)
- Apache Commons Math (estatística)
- DL4J (deep learning, se necessário)
```

### Stack Recomendada para IA

**Opção 1 - Python (recomendado):**
- **Framework:** FastAPI
- **ML:** scikit-learn, statsmodels, Prophet
- **NLP:** spaCy, transformers (BERT)
- **Cache:** Redis
- **Filas:** Celery + RabbitMQ
- **Deploy:** Docker + Railway/Render

**Opção 2 - Java:**
- **ML:** Smile, Weka
- **NLP:** Stanford CoreNLP
- **Cache:** Caffeine + Redis
- **Async:** Spring @Async + CompletableFuture

---

## 📊 Pipeline de Dados

### 1. Coleta de Dados
```sql
SELECT 
  e.id, e.date, e.amount, e.description,
  c.id as category_id, c.code as category_code,
  pm.id as payment_method_id
FROM expenses e
JOIN categories c ON e.category_id = c.id
JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = :userId
  AND e.date >= :startDate
ORDER BY e.date DESC;
```

### 2. Feature Engineering (Python)
```python
# Para previsão de gastos
features = {
    'month': date.month,
    'year': date.year,
    'day_of_week': date.weekday(),
    'is_weekend': date.weekday() >= 5,
    'category_id': category.id,
    'amount': amount,
    'lag_1_month': previous_month_total,
    'lag_3_months_avg': avg_last_3_months,
    'rolling_std': std_last_6_months
}

# Para categorização
text_features = TfidfVectorizer().fit_transform(descriptions)
numerical_features = [amount, payment_method_id, day_of_month]
combined = np.hstack([text_features, numerical_features])
```

### 3. Treinamento de Modelos
```python
# Previsão (Prophet)
from fbprophet import Prophet

df = pd.DataFrame({
    'ds': dates,
    'y': amounts
})

model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=False
)
model.fit(df)
future = model.make_future_dataframe(periods=3, freq='M')
forecast = model.predict(future)

# Categorização (Naive Bayes)
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(max_features=1000)
X = vectorizer.fit_transform(descriptions)
y = category_ids

model = MultinomialNB()
model.fit(X, y)

# Salvar modelo
import joblib
joblib.dump(model, f'models/user_{user_id}_categorizer.pkl')
```

### 4. Re-treinamento Automático
```python
# Cron job semanal (Celery)
@celery.task
def retrain_user_models(user_id):
    expenses = fetch_user_expenses(user_id, last_7_days=True)
    
    if len(expenses) >= 10:
        retrain_categorizer(user_id, expenses)
        retrain_forecaster(user_id, expenses)
        
    redis_client.delete(f"predictions:{user_id}")
```

---

## 🔒 Privacidade e Segurança

### LGPD/GDPR Compliance

1. **Dados Anonimizados para Benchmarks:**
   ```sql
   SELECT 
     category_id,
     AVG(amount) as avg_amount,
     COUNT(*) as total_expenses
   FROM expenses
   WHERE EXTRACT(YEAR FROM AGE(NOW(), user.created_at)) < 1
   GROUP BY category_id
   HAVING COUNT(*) >= 100;
   ```

2. **Modelos Individuais:**
   - Cada usuário tem seus próprios modelos de ML
   - Nada de compartilhamento de dados brutos entre usuários
   - Apenas estatísticas agregadas anônimas

3. **Consentimento:**
   ```json
   {
     "aiPreferences": {
       "enablePredictions": true,
       "enableRecommendations": true,
       "shareBenchmarkData": false
     }
   }
   ```

4. **Auditoria:**
   ```java
   @Entity
   public class AIAuditLog {
       private String userId;
       private String endpoint;
       private LocalDateTime timestamp;
       private String modelVersion;
       private Double confidence;
   }
   ```

---

## 📈 Métricas de Sucesso

### KPIs de Produto
1. **Adoção de IA:**
   - % usuários que usam previsões (meta: 60%)
   - % despesas auto-categorizadas (meta: 80%)

2. **Impacto Financeiro:**
   - Economia média por usuário/mês (meta: R$ 200)
   - Usuários com déficit evitado (meta: 30%)

3. **Engajamento:**
   - Usuários que seguem recomendações (meta: 40%)
   - Tempo de sessão +25%

### KPIs Técnicos
1. **Performance:**
   - Tempo de resposta < 2s (p95)
   - Uptime > 99.5%

2. **Acurácia dos Modelos:**
   - Previsão de gastos: MAPE < 15%
   - Categorização: Accuracy > 85%
   - Anomalias: Precision > 70%, Recall > 80%

---

## 🚀 Roadmap de Implementação

### Fase 1 - MVP (2 meses)
- [ ] **Semana 1-2:** Setup microserviço Python + integração
- [ ] **Semana 3-4:** Previsão de gastos (Prophet)
- [ ] **Semana 5-6:** Categorização automática (Naive Bayes)
- [ ] **Semana 7-8:** Detecção de anomalias (Z-score)
- [ ] **Semana 8:** Testes A/B + Deploy

### Fase 2 - Insights Avançados (1 mês)
- [ ] Recomendações de economia
- [ ] Fluxo de caixa preditivo
- [ ] Benchmarks anônimos

### Fase 3 - Gamificação (1 mês)
- [ ] Metas inteligentes
- [ ] Sistema de conquistas
- [ ] Desafios semanais

### Fase 4 - IA Conversacional (2 meses)
- [ ] Chatbot financeiro (GPT-4)
- [ ] Comandos por voz
- [ ] Relatórios em linguagem natural

---

## 💻 Exemplos de Código

### Backend - Endpoint de Previsão (Spring Boot)
```java
@RestController
@RequestMapping("/api/ai")
public class AIController {
    
    @Autowired
    private AIPredictionService aiService;
    
    @PostMapping("/predictions/monthly-expenses")
    public ResponseEntity<PredictionResponse> predictExpenses(
        @RequestBody PredictionRequest request,
        @AuthenticationPrincipal UserDetails user
    ) {
        String userId = user.getUsername();
        PredictionResponse predictions = aiService.predictMonthlyExpenses(
            userId,
            request.getCategoryId(),
            request.getForecastMonths()
        );
        return ResponseEntity.ok(predictions);
    }
}
```

### AI Service - Chamada ao Microserviço Python
```java
@Service
public class AIPredictionService {
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    private final ExpenseRepository expenseRepo;
    
    public PredictionResponse predictMonthlyExpenses(
        String userId, 
        Long categoryId, 
        int months
    ) {
        List<Expense> history = expenseRepo.findByUserIdAndCategoryId(
            userId, 
            categoryId,
            LocalDate.now().minusMonths(12)
        );
        
        AIRequest aiRequest = new AIRequest();
        aiRequest.setUserId(userId);
        aiRequest.setCategoryId(categoryId);
        aiRequest.setHistoricalData(history);
        aiRequest.setForecastMonths(months);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<AIRequest> entity = new HttpEntity<>(aiRequest, headers);
        
        ResponseEntity<PredictionResponse> response = restTemplate.postForEntity(
            aiServiceUrl + "/predict",
            entity,
            PredictionResponse.class
        );
        
        return response.getBody();
    }
}
```

### Python - Microserviço de Previsão (FastAPI)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from fbprophet import Prophet
import redis
import json

app = FastAPI()
redis_client = redis.Redis(host='localhost', port=6379, db=0)

class HistoricalExpense(BaseModel):
    date: str
    amount: float

class PredictionRequest(BaseModel):
    userId: str
    categoryId: Optional[int]
    historicalData: List[HistoricalExpense]
    forecastMonths: int = 3

class PredictionResponse(BaseModel):
    predictions: List[dict]
    totalPredicted: float
    modelAccuracy: float

@app.post("/predict", response_model=PredictionResponse)
async def predict_expenses(request: PredictionRequest):
    cache_key = f"prediction:{request.userId}:{request.categoryId}"
    
    # Verificar cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Preparar dados
    df = pd.DataFrame([
        {'ds': exp.date, 'y': exp.amount}
        for exp in request.historicalData
    ])
    
    if len(df) < 6:
        raise HTTPException(
            status_code=400,
            detail="Mínimo de 6 meses de histórico necessário"
        )
    
    # Treinar modelo
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False
    )
    model.fit(df)
    
    # Fazer previsão
    future = model.make_future_dataframe(periods=request.forecastMonths, freq='M')
    forecast = model.predict(future)
    
    # Preparar resposta
    predictions = []
    for idx in range(-request.forecastMonths, 0):
        row = forecast.iloc[idx]
        predictions.append({
            "month": row['ds'].strftime('%Y-%m'),
            "predictedAmount": round(row['yhat'], 2),
            "confidence": 0.85,
            "minExpected": round(row['yhat_lower'], 2),
            "maxExpected": round(row['yhat_upper'], 2)
        })
    
    response = {
        "predictions": predictions,
        "totalPredicted": sum(p["predictedAmount"] for p in predictions),
        "modelAccuracy": 0.89
    }
    
    # Cachear por 24h
    redis_client.setex(cache_key, 86400, json.dumps(response))
    
    return response
```

### Frontend - Componente de Previsão (Vue.js)
```vue
<template>
  <v-card class="prediction-card">
    <v-card-title>
      <v-icon color="primary">mdi-crystal-ball</v-icon>
      Previsão de Gastos - {{ categoryName }}
    </v-card-title>
    
    <v-card-text>
      <v-progress-circular v-if="loading" indeterminate />
      
      <div v-else>
        <v-alert 
          v-if="predictions.trend === 'increasing'" 
          type="warning"
          class="mb-4"
        >
          Seus gastos estão aumentando! 
          Previsão para próximo mês: R$ {{ predictions.nextMonth }}
        </v-alert>
        
        <v-list>
          <v-list-item 
            v-for="pred in predictions.items" 
            :key="pred.month"
          >
            <v-list-item-title>
              {{ formatMonth(pred.month) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              R$ {{ pred.predictedAmount.toFixed(2) }}
              <v-chip small :color="getTrendColor(pred.trend)">
                {{ pred.trend }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      predictions: null,
      loading: false,
      categoryName: 'Alimentação'
    }
  },
  
  async mounted() {
    await this.fetchPredictions()
  },
  
  methods: {
    async fetchPredictions() {
      this.loading = true
      try {
        const response = await axios.post('/api/ai/predictions/monthly-expenses', {
          categoryId: 1,
          forecastMonths: 3
        })
        this.predictions = response.data
      } catch (error) {
        console.error('Erro ao buscar previsões:', error)
      } finally {
        this.loading = false
      }
    },
    
    getTrendColor(trend) {
      return {
        'increasing': 'error',
        'stable': 'success',
        'decreasing': 'info'
      }[trend]
    },
    
    formatMonth(monthStr) {
      const [year, month] = monthStr.split('-')
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return `${months[parseInt(month) - 1]}/${year}`
    }
  }
}
</script>
```

---

## 📚 Recursos e Referências

### Tutoriais
1. **Prophet (Facebook):** https://facebook.github.io/prophet/
2. **Scikit-learn Guide:** https://scikit-learn.org/stable/tutorial/
3. **FastAPI Docs:** https://fastapi.tiangolo.com/
4. **Spring AI:** https://spring.io/projects/spring-ai

### Papers Acadêmicos
1. Time Series Forecasting: https://otexts.com/fpp3/
2. Anomaly Detection: https://arxiv.org/abs/2105.13345
3. Text Classification: https://aclanthology.org/N19-1423/

### Inspiração (Apps Concorrentes)
- **Nubank:** Insights de gastos mensais
- **Guiabolso:** Categorização automática
- **Mobills:** Metas inteligentes
- **Organizze:** Relatórios preditivos

---

## ✅ Checklist de Entregáveis

### Backend
- [ ] Endpoint `/api/ai/predictions/monthly-expenses`
- [ ] Endpoint `/api/ai/anomalies`
- [ ] Endpoint `/api/ai/savings-recommendations`
- [ ] Endpoint `/api/ai/categorize`
- [ ] Endpoint `/api/ai/cashflow-insights`
- [ ] Documentação Swagger completa
- [ ] Testes unitários (>80% cobertura)
- [ ] Integração com microserviço Python/Java

### Microserviço IA
- [ ] Setup FastAPI + Docker
- [ ] Modelo de previsão (Prophet)
- [ ] Modelo de categorização (Naive Bayes)
- [ ] Detecção de anomalias (Z-score)
- [ ] Cache Redis
- [ ] Pipeline de re-treinamento (Celery)
- [ ] Logs e monitoramento

### Frontend
- [ ] Componente `<PredictionCard>`
- [ ] Componente `<AnomaliesAlert>`
- [ ] Componente `<SavingsRecommendations>`
- [ ] Integração com endpoints de IA
- [ ] Loading states + error handling
- [ ] Testes E2E (Cypress)

### DevOps
- [ ] Docker Compose para dev local
- [ ] Deploy microserviço (Railway/Render)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Sentry/DataDog)

---

## 🎯 Resultado Esperado

### Valor para o Usuário
- **Economia mensal:** R$ 200 - R$ 500
- **Tempo economizado:** 15 min/mês (categorização manual)
- **Redução de surpresas:** 80% de despesas inesperadas evitadas
- **Conscientização:** 3x mais usuários atingindo metas

### Diferencial Competitivo
- **Único app com IA preditiva** no mercado brasileiro
- **Recomendações personalizadas** baseadas em ML
- **Open-source friendly** (pode virar case de sucesso)

---

## 📞 Como Usar Este Prompt

### Para GitHub Copilot (IntelliJ IDEA)
```
Estou desenvolvendo um sistema de orçamento pessoal em Java Spring Boot. 
Preciso implementar funcionalidades de IA conforme o documento AI_IMPROVEMENT_PROMPT.md.

Vamos começar com o endpoint de previsão de gastos mensais (Seção 1️⃣).
Por favor, gere:
1. A entidade JPA PredictionRequest
2. O controller AIController
3. O service AIPredictionService
4. Configuração do RestTemplate
```

### Iterações Sugeridas
1. **Fase 1:** Endpoints básicos
2. **Fase 2:** Integração com microserviço Python
3. **Fase 3:** Testes e validação
4. **Fase 4:** Deploy e monitoramento

---

**Pronto para revolucionar finanças pessoais com IA? 🚀**
