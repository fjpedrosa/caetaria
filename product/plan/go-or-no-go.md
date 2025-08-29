# 🚦 GO/NO-GO Decision Framework – Caetaria

## 🎯 Objetivo
Documento maestro con todos los checkpoints de decisión objetivos para evaluar la viabilidad del proyecto en cada fase.

---

## 📊 Diagrama de Flujo Maestro

```mermaid
flowchart TD
    Start([Inicio Proyecto]) --> Week1[Semana 1: Customer Development]
    
    Week1 --> CP1{Checkpoint 1<br/>Semana 2}
    CP1 -->|Conversion <1%<br/>CTR <0.5%| Pivot1[PIVOT Messaging]
    CP1 -->|CPL >€100| Pause1[PAUSE Estrategia]
    CP1 -->|Métricas OK| Week3[Continuar Validación]
    
    Week3 --> CP2{Checkpoint 2<br/>Semana 4}
    CP2 -->|Leads <50| Pivot2[PIVOT Canal]
    CP2 -->|Problem <70%| Kill1[KILL Proyecto]
    CP2 -->|Pricing <30%| Pivot3[PIVOT Pricing]
    CP2 -->|Todo OK| MVP[Desarrollar MVP]
    
    MVP --> CP3{Checkpoint 3<br/>Mes 3}
    CP3 -->|No cumple criterios| Kill2[KILL/PIVOT Major]
    CP3 -->|Cumple parcial| Optimize[Optimizar 2 semanas]
    CP3 -->|Cumple todos| Beta[Lanzar Beta]
    
    Beta --> CP4{Checkpoint 4<br/>Mes 6}
    CP4 -->|Users <5| Pivot4[PIVOT Messaging]
    CP4 -->|NPS <20| Kill3[KILL - No PMF]
    CP4 -->|Paying <3| Pivot5[PIVOT Value Prop]
    CP4 -->|NPS >40 & Paying ≥5| Scale[Preparar Scale]
    
    Scale --> CP5{Checkpoint 5<br/>Mes 8}
    CP5 -->|MRR <€500| Kill4[KILL Proyecto]
    CP5 -->|Churn >15%| Focus[Focus Retención]
    CP5 -->|LTV/CAC <1| PauseAcq[Pausar Adquisición]
    CP5 -->|Métricas OK| Growth[Crecimiento]
    
    Growth --> CP6{Checkpoint 6<br/>Mes 12}
    CP6 -->|MRR >€8k| Bootstrap[Bootstrap Growth]
    CP6 -->|MRR >€5k & Growth >20%| Funding[Raise Funding]
    CP6 -->|MRR <€3k| Exit[Buscar Exit]
    CP6 -->|Métricas Fail| Kill5[KILL Final]
    
    style CP1 fill:#ffeb3b
    style CP2 fill:#ffeb3b
    style CP3 fill:#ff9800
    style CP4 fill:#ff9800
    style CP5 fill:#4caf50
    style CP6 fill:#4caf50
    style Kill1 fill:#f44336,color:#fff
    style Kill2 fill:#f44336,color:#fff
    style Kill3 fill:#f44336,color:#fff
    style Kill4 fill:#f44336,color:#fff
    style Kill5 fill:#f44336,color:#fff
```

---

## 🔍 CHECKPOINT 1: Validación Inicial (Semana 2)

### Objetivo
Validar interés inicial y viabilidad del canal de adquisición.

### Métricas Requeridas
```yaml
Datos mínimos necesarios:
  - Visitantes únicos: ≥500
  - Impresiones ads: ≥10,000
  - Presupuesto gastado: €200-300
```

### Criterios de Decisión

```mermaid
flowchart LR
    Start[Evaluar Métricas] --> Q1{CTR ≥0.8%?}
    Q1 -->|No| R1[REVISAR Creativos]
    Q1 -->|Sí| Q2{Conversión ≥1.5%?}
    Q2 -->|No| R2[REVISAR Landing]
    Q2 -->|Sí| Q3{CPL ≤€80?}
    Q3 -->|No| R3[REVISAR Targeting]
    Q3 -->|Sí| GO[✅ CONTINUE]
    
    R1 --> Q4{Mejora en 1 semana?}
    R2 --> Q4
    R3 --> Q4
    Q4 -->|No| NOGO[❌ PIVOT/KILL]
    Q4 -->|Sí| GO
    
    style GO fill:#4caf50,color:#fff
    style NOGO fill:#f44336,color:#fff
```

### Acciones según Resultado

| Métrica | Valor | Decisión | Acción |
|---------|-------|----------|--------|
| CTR | <0.5% | 🔴 CRÍTICO | Pausar campañas, revisar messaging |
| CTR | 0.5-0.8% | 🟡 OPTIMIZAR | A/B test nuevos creativos |
| CTR | >0.8% | 🟢 CONTINUAR | Mantener y escalar |
| Conversión | <1% | 🔴 CRÍTICO | Rediseñar landing completo |
| Conversión | 1-1.5% | 🟡 OPTIMIZAR | A/B test elementos landing |
| Conversión | >1.5% | 🟢 CONTINUAR | Escalar tráfico |
| CPL | >€100 | 🔴 CRÍTICO | Cambiar estrategia completa |
| CPL | €80-100 | 🟡 OPTIMIZAR | Refinar targeting |
| CPL | <€80 | 🟢 CONTINUAR | Aumentar presupuesto |

---

## 🔍 CHECKPOINT 2: Validación Completa (Semana 4)

### Objetivo
Confirmar problem-solution fit y disposición de pago antes de construir.

### Métricas Requeridas
```yaml
Customer Development:
  - Entrevistas completadas: ≥30
  - Surveys de pricing: ≥50
  - Leads generados: ≥50
  - Demos agendadas: ≥10
```

### Diagrama de Decisión

```mermaid
flowchart TD
    Start[Analizar Resultados] --> V1{Problem Validation ≥70%?}
    V1 -->|No| Kill[❌ KILL - No hay problema real]
    V1 -->|Sí| V2{Pricing Acceptance ≥30%?}
    V2 -->|No| Pivot1[PIVOT Pricing Model]
    V2 -->|Sí| V3{Lead Quality ≥40?}
    V3 -->|No| Pivot2[PIVOT Targeting]
    V3 -->|Sí| V4{Demo Interest ≥20%?}
    V4 -->|No| Pivot3[PIVOT Value Prop]
    V4 -->|Sí| GO[✅ BUILD MVP]
    
    Pivot1 --> Retest[Revalidar 2 semanas]
    Pivot2 --> Retest
    Pivot3 --> Retest
    Retest --> V1
    
    style Kill fill:#f44336,color:#fff
    style GO fill:#4caf50,color:#fff
```

### Matriz de Decisión

| Criterio | Peso | Mínimo | Ideal | Resultado | Score |
|----------|------|--------|-------|-----------|-------|
| Problem Validation | 30% | 70% | 85% | _____% | _____ |
| Pricing Acceptance | 25% | 30% | 50% | _____% | _____ |
| Lead Quality | 20% | 40 | 60 | _____ | _____ |
| Demo Interest | 15% | 20% | 40% | _____% | _____ |
| Competition Weak | 10% | Yes | Yes | _____ | _____ |
| **TOTAL SCORE** | 100% | **60** | **80** | | _____ |

**Decisión**: Score ≥60 = GO | Score 40-60 = OPTIMIZE | Score <40 = KILL

---

## 🔍 CHECKPOINT 3: Go/No-Go MVP (Mes 3)

### Objetivo
Evaluar si hay suficiente validación para invertir en desarrollo del MVP.

### Criterios Consolidados

```mermaid
graph LR
    subgraph "Requisitos Mínimos - TODOS necesarios"
        R1[Problem Validation >70%]
        R2[Pricing Validation >30%]
        R3[Lead Quality >40]
        R4[CPL <€50]
        R5[Conversion >1.5%]
    end
    
    subgraph "Decisión"
        D1{Cumple TODOS?}
        D1 -->|Sí| GO[✅ BUILD MVP]
        D1 -->|No - Falla 1| OPT[🟡 OPTIMIZE 2 semanas]
        D1 -->|No - Falla 2+| PIVOT[🔴 PIVOT MAJOR]
    end
    
    R1 & R2 & R3 & R4 & R5 --> D1
```

### Investment Decision Framework

```python
def mvp_investment_decision(metrics):
    """
    Decisión de inversión para MVP basada en métricas
    """
    
    required_metrics = {
        'problem_validation': 0.70,
        'pricing_acceptance': 0.30,
        'lead_quality_avg': 40,
        'cpl': 50,
        'conversion_rate': 0.015
    }
    
    failures = []
    for metric, threshold in required_metrics.items():
        if metric.startswith('cpl'):
            if metrics[metric] > threshold:
                failures.append(metric)
        else:
            if metrics[metric] < threshold:
                failures.append(metric)
    
    if len(failures) == 0:
        return {
            'decision': 'GO',
            'action': 'Proceed with MVP development',
            'budget': '€3,000',
            'timeline': '8-10 weeks'
        }
    elif len(failures) == 1:
        return {
            'decision': 'OPTIMIZE',
            'action': f'Fix {failures[0]} and retest',
            'budget': '€500',
            'timeline': '2 weeks'
        }
    else:
        return {
            'decision': 'PIVOT/KILL',
            'action': 'Major pivot needed or kill project',
            'failures': failures
        }
```

---

## 🔍 CHECKPOINT 4: Beta Success (Mes 6)

### Objetivo
Evaluar si el producto tiene tracción real con usuarios beta.

### Métricas Beta

```mermaid
flowchart TD
    Start[Evaluar Beta] --> M1{Beta Users ≥5?}
    M1 -->|No| P1[PIVOT Canal/Messaging]
    M1 -->|Sí| M2{Activation ≥30%?}
    M2 -->|No| P2[Rediseñar Onboarding]
    M2 -->|Sí| M3{Weekly Active ≥40%?}
    M3 -->|No| P3[Mejorar Engagement]
    M3 -->|Sí| M4{Paying ≥3?}
    M4 -->|No| P4[Revisar Pricing]
    M4 -->|Sí| M5{NPS ≥40?}
    M5 -->|No & <20| Kill[❌ KILL - No PMF]
    M5 -->|No & 20-40| P5[Mejorar Producto]
    M5 -->|Sí| Scale[✅ PREPARE SCALE]
    
    P1 --> Retry[Retry 4 weeks]
    P2 --> Retry
    P3 --> Retry
    P4 --> Retry
    P5 --> Retry
    
    style Kill fill:#f44336,color:#fff
    style Scale fill:#4caf50,color:#fff
```

### Beta Health Dashboard

| Métrica | Red Flag | Warning | Healthy | Target |
|---------|----------|---------|---------|---------|
| Beta Users | <5 | 5-10 | >10 | 15 |
| Activation Rate | <20% | 20-30% | >30% | 50% |
| Weekly Active | <20% | 20-40% | >40% | 60% |
| Support Tickets/User | >5 | 3-5 | <3 | <2 |
| NPS | <20 | 20-40 | >40 | >50 |
| Paying Customers | 0 | 1-2 | ≥3 | ≥5 |
| Churn Rate | >20% | 10-20% | <10% | <5% |

---

## 🔍 CHECKPOINT 5: Product-Market Fit (Mes 8)

### Objetivo
Confirmar que existe un mercado viable y sostenible.

### PMF Validation Matrix

```mermaid
graph TD
    subgraph "Growth Metrics"
        G1[MRR ≥€1,000]
        G2[Customers ≥30]
        G3[M/M Growth ≥15%]
    end
    
    subgraph "Health Metrics"
        H1[Churn <10%]
        H2[LTV/CAC >2]
        H3[NPS >40]
    end
    
    subgraph "Decision"
        D{All Green?}
        D -->|Yes| SCALE[✅ SCALE AGGRESSIVELY]
        D -->|1-2 Yellow| OPTIMIZE[🟡 OPTIMIZE & RETRY]
        D -->|3+ Yellow or Any Red| PIVOT[🔴 PIVOT OR KILL]
    end
    
    G1 & G2 & G3 --> D
    H1 & H2 & H3 --> D
    
    style SCALE fill:#4caf50,color:#fff
    style PIVOT fill:#f44336,color:#fff
```

### Unit Economics Calculator

```javascript
// Calculadora de unit economics para decisión
const unitEconomics = {
  // Inputs
  avgMonthlyRevenue: 35,  // € per customer
  avgCustomerLifespan: 12, // months
  avgAcquisitionCost: 100, // €
  
  // Calculations
  ltv: function() {
    return this.avgMonthlyRevenue * this.avgCustomerLifespan;
  },
  
  ltvCacRatio: function() {
    return this.ltv() / this.avgAcquisitionCost;
  },
  
  paybackPeriod: function() {
    return this.avgAcquisitionCost / this.avgMonthlyRevenue;
  },
  
  // Decision
  decision: function() {
    const ratio = this.ltvCacRatio();
    const payback = this.paybackPeriod();
    
    if (ratio > 3 && payback < 6) {
      return "✅ SCALE - Economics are strong";
    } else if (ratio > 2 && payback < 12) {
      return "🟡 OPTIMIZE - Improve retention or reduce CAC";
    } else {
      return "🔴 STOP - Unit economics not viable";
    }
  }
};
```

---

## 🔍 CHECKPOINT 6: Scale Decision (Mes 12)

### Objetivo
Determinar estrategia de crecimiento o salida.

### Strategic Options Tree

```mermaid
graph TD
    Start[Evaluate Year 1] --> Q1{MRR Status?}
    
    Q1 -->|>€8,000| Path1[Strong Traction]
    Q1 -->|€3,000-8,000| Path2[Moderate Traction]
    Q1 -->|<€3,000| Path3[Weak Traction]
    
    Path1 --> Q2{Growth Rate?}
    Q2 -->|>20% M/M| Funding[🚀 RAISE FUNDING]
    Q2 -->|10-20%| Bootstrap[💪 BOOTSTRAP]
    Q2 -->|<10%| Optimize1[🔧 OPTIMIZE]
    
    Path2 --> Q3{Churn Rate?}
    Q3 -->|<10%| Focus[🎯 FOCUS & GROW]
    Q3 -->|10-15%| Fix[🔧 FIX RETENTION]
    Q3 -->|>15%| Pivot[🔄 PIVOT MODEL]
    
    Path3 --> Q4{Any Interest?}
    Q4 -->|Acquisition Offers| Exit[💰 SEEK EXIT]
    Q4 -->|Partner Interest| Partner[🤝 PARTNERSHIP]
    Q4 -->|None| Kill[❌ KILL PROJECT]
    
    style Funding fill:#9c27b0,color:#fff
    style Bootstrap fill:#4caf50,color:#fff
    style Exit fill:#ff9800,color:#fff
    style Kill fill:#f44336,color:#fff
```

### Year 1 Success Criteria

| Scenario | MRR | Customers | Churn | LTV/CAC | Decision |
|----------|-----|-----------|-------|---------|----------|
| 🟢 **Best** | >€8k | >200 | <8% | >3 | Scale/Funding |
| 🟡 **Good** | €3-8k | 50-200 | <12% | >2 | Bootstrap |
| 🟠 **Marginal** | €1-3k | 20-50 | <15% | >1.5 | Optimize |
| 🔴 **Failed** | <€1k | <20 | >15% | <1 | Kill/Exit |

---

## 🚨 KILL CRITERIA (Inmediatos)

### Triggers de Cancelación Automática

```mermaid
graph LR
    subgraph "Pre-MVP Kill Triggers"
        K1[Conversion <0.5% after 1000 visitors]
        K2[CPL >€150 for 2 weeks]
        K3[0 demos after 50 leads]
        K4[Problem validation <20%]
    end
    
    subgraph "Beta Kill Triggers"
        K5[<3 active users after 2 months]
        K6[NPS <0]
        K7[Churn >30% monthly]
        K8[0 paying after 20 trials]
    end
    
    subgraph "Scale Kill Triggers"
        K9[CAC Payback >12 months]
        K10[LTV/CAC <1 sustained]
        K11[MRR decline 3 months]
        K12[Major competitor dominates]
    end
    
    K1 & K2 & K3 & K4 --> KILL1[❌ KILL PROJECT]
    K5 & K6 & K7 & K8 --> KILL2[❌ KILL PROJECT]
    K9 & K10 & K11 & K12 --> KILL3[❌ KILL PROJECT]
    
    style KILL1 fill:#f44336,color:#fff
    style KILL2 fill:#f44336,color:#fff
    style KILL3 fill:#f44336,color:#fff
```

---

## 📊 Sistema de Alertas Automáticas

### Configuración de Alertas por Fase

```javascript
const alertSystem = {
  // FASE 1: Validación
  validation: {
    alerts: [
      {
        metric: 'daily_spend',
        condition: '> budget * 1.2',
        action: 'PAUSE_CAMPAIGNS',
        notification: 'immediate'
      },
      {
        metric: 'conversion_rate',
        condition: '< 0.5%',
        action: 'REVIEW_LANDING',
        notification: 'daily'
      }
    ]
  },
  
  // FASE 2: MVP
  mvp: {
    alerts: [
      {
        metric: 'development_delay',
        condition: '> 1 week',
        action: 'SCOPE_REDUCTION',
        notification: 'immediate'
      },
      {
        metric: 'beta_signups',
        condition: '< 5 by week 2',
        action: 'INCREASE_OUTREACH',
        notification: 'weekly'
      }
    ]
  },
  
  // FASE 3: Growth
  growth: {
    alerts: [
      {
        metric: 'churn_rate',
        condition: '> 15%',
        action: 'CUSTOMER_INTERVIEWS',
        notification: 'immediate'
      },
      {
        metric: 'cac',
        condition: '> ltv * 0.5',
        action: 'PAUSE_PAID_ACQUISITION',
        notification: 'immediate'
      }
    ]
  }
};
```

---

## 📈 Dashboard SQL para Decisiones

### Query Maestro de Decisión Semanal

```sql
-- Dashboard de decisión GO/NO-GO
WITH weekly_metrics AS (
  SELECT 
    -- Acquisition
    COUNT(DISTINCT CASE WHEN event = 'visitor' THEN user_id END) as visitors,
    COUNT(DISTINCT CASE WHEN event = 'lead' THEN user_id END) as leads,
    AVG(CASE WHEN event = 'lead' THEN lead_score END) as avg_lead_score,
    
    -- Conversion
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'lead' THEN user_id END) / 
          NULLIF(COUNT(DISTINCT CASE WHEN event = 'visitor' THEN user_id END), 0), 2) as conversion_rate,
    
    -- Cost
    SUM(CASE WHEN source = 'paid' THEN cost END) as total_spend,
    SUM(CASE WHEN source = 'paid' THEN cost END) / 
        NULLIF(COUNT(DISTINCT CASE WHEN event = 'lead' THEN user_id END), 0) as cpl,
    
    -- Engagement (Beta only)
    COUNT(DISTINCT CASE WHEN event = 'active_user' THEN user_id END) as active_users,
    AVG(CASE WHEN event = 'nps_response' THEN score END) as nps_score,
    
    -- Revenue (Post-Beta)
    COUNT(DISTINCT CASE WHEN event = 'payment' THEN user_id END) as paying_customers,
    SUM(CASE WHEN event = 'payment' THEN amount END) as revenue
    
  FROM events
  WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
),
decision_logic AS (
  SELECT 
    *,
    -- Decision rules
    CASE 
      -- Validation Phase
      WHEN visitors > 100 AND conversion_rate < 1 THEN 'PIVOT_LANDING'
      WHEN leads > 20 AND avg_lead_score < 40 THEN 'PIVOT_TARGETING'
      WHEN cpl > 100 THEN 'PAUSE_ADS'
      
      -- Beta Phase
      WHEN active_users < 5 AND leads > 50 THEN 'PIVOT_PRODUCT'
      WHEN nps_score < 20 AND active_users > 5 THEN 'KILL_PROJECT'
      
      -- Growth Phase
      WHEN paying_customers > 10 AND revenue/total_spend < 1 THEN 'OPTIMIZE_PRICING'
      WHEN paying_customers > 30 AND revenue/total_spend > 3 THEN 'SCALE'
      
      ELSE 'CONTINUE'
    END as recommended_action,
    
    -- Confidence level
    CASE 
      WHEN visitors < 100 OR leads < 10 THEN 'LOW'
      WHEN visitors < 500 OR leads < 50 THEN 'MEDIUM'
      ELSE 'HIGH'
    END as confidence_level
    
  FROM weekly_metrics
)
SELECT 
  *,
  -- Add urgency flag
  CASE 
    WHEN recommended_action IN ('KILL_PROJECT', 'PAUSE_ADS') THEN '🔴 URGENT'
    WHEN recommended_action LIKE 'PIVOT%' THEN '🟡 HIGH'
    WHEN recommended_action = 'SCALE' THEN '🟢 OPPORTUNITY'
    ELSE '⚪ NORMAL'
  END as urgency
FROM decision_logic;
```

---

## ✅ Checklist de Decisión Rápida

### Usar en cada checkpoint:

- [ ] ¿Tenemos suficientes datos? (n > mínimo requerido)
- [ ] ¿Los datos son estadísticamente significativos?
- [ ] ¿Hemos eliminado outliers y anomalías?
- [ ] ¿Las métricas son consistentes en el tiempo?
- [ ] ¿Hemos validado con datos cualitativos?
- [ ] ¿El equipo está alineado con la decisión?
- [ ] ¿Tenemos recursos para ejecutar la decisión?
- [ ] ¿Hemos documentado la decisión y rationale?

### Matriz de Decisión Rápida

| Si tu... | Y tu... | Entonces... |
|----------|---------|-------------|
| Conversión <1% | CPL >€100 | **KILL** - No hay fit |
| Conversión 1-2% | CPL €50-100 | **OPTIMIZE** - Hay potencial |
| Conversión >2% | CPL <€50 | **SCALE** - Acelera |
| NPS <20 | Churn >20% | **KILL** - No hay PMF |
| NPS 20-40 | Churn 10-20% | **ITERATE** - Mejorar producto |
| NPS >40 | Churn <10% | **GROW** - Tienes PMF |
| MRR crece <10% | CAC crece >20% | **PAUSE** - Optimiza economics |
| MRR crece >20% | CAC estable | **INVEST** - Acelera crecimiento |

---

## 📅 Timeline de Checkpoints

```mermaid
gantt
    title GO/NO-GO Decision Timeline
    dateFormat  YYYY-MM-DD
    section Validación
    Customer Development    :2024-01-01, 7d
    Checkpoint 1           :milestone, 2024-01-14, 0d
    Campaign Optimization   :2024-01-15, 7d
    Checkpoint 2           :milestone, 2024-01-28, 0d
    
    section MVP
    Development Sprint 1    :2024-02-01, 14d
    Development Sprint 2    :2024-02-15, 14d
    Checkpoint 3           :milestone, 2024-03-01, 0d
    
    section Beta
    Beta Launch            :2024-03-15, 30d
    Beta Iteration         :2024-04-15, 30d
    Checkpoint 4           :milestone, 2024-06-01, 0d
    
    section Growth
    PMF Search             :2024-06-15, 60d
    Checkpoint 5           :milestone, 2024-08-15, 0d
    Scale Preparation      :2024-08-16, 60d
    Checkpoint 6           :milestone, 2024-12-01, 0d
```

---

## 🎯 Resumen Ejecutivo

### Los 6 Checkpoints Clave:

1. **Semana 2**: Validación canal (CTR, Conversión, CPL)
2. **Semana 4**: Problem-Solution Fit (70% validation)
3. **Mes 3**: MVP Investment Decision (5 criterios)
4. **Mes 6**: Beta Success (Users, NPS, Paying)
5. **Mes 8**: Product-Market Fit (MRR, Churn, LTV/CAC)
6. **Mes 12**: Scale Strategy (Bootstrap/Funding/Exit)

### Regla de Oro:
> "Si dudas entre continuar o parar, **los datos deben ser convincentemente positivos** para continuar. En caso de duda, pivota o mata el proyecto."

---

*Documento actualizado: Agosto 2025*
*Próxima revisión: En cada checkpoint*