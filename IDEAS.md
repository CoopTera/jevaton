# IDEAS.md — 4 proyectos para la hackathon

## 1. Portero de formularios
- **Decisión:** ¿este mensaje de contacto es lead real o ruido? `{lead, ruido}`
- **Input:** texto del formulario de contacto de tu sitio.
- **Acción:** si `p("lead") > 0.75` → manda mail/Slack al equipo de ventas; si no, lo archiva en silencio.

## 2. Semáforo de deploys
- **Decisión:** ¿es seguro deployar ahora? `{deployar, esperar, rollback}`
- **Input:** resumen tipado del estado: tests rotos, % de errores recientes, día/hora.
- **Acción:** si `p("deployar") > 0.8` → dispara el deploy; si `p("rollback") > 0.5` → revierte el último release.

## 3. Triaje de bugs
- **Decisión:** ¿qué prioridad tiene este issue? `{p0_critico, p1_alta, p2_normal, p3_baja}`
- **Input:** título + descripción del issue (pegado o via GitHub API).
- **Acción:** si `p("p0_critico") > 0.6` → pagea al on-call y le pone label rojo; si no, solo etiqueta.

## 4. Moderador de chat en vivo
- **Decisión:** ¿este mensaje viola las reglas? `{ok, warn, ban}`
- **Input:** cada mensaje del chat en tiempo real.
- **Acción:** si `p("ban") > 0.85` → borra y banea; si `p("warn") > 0.6` → flag para revisión humana.
